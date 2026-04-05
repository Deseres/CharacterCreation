using CharacterCreation.Application.Data;
using CharacterCreation.Application.Services;
using CharacterCreation.Domain.Entities;
using CharacterCreation.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CharacterCreation.Api.Controllers;

/// <summary>
/// API endpoints for the character creation wizard
/// </summary>
[ApiController]
[Route("api/wizard")]
public sealed class CharacterWizardController(ApplicationDbContext dbContext) : ControllerBase
{
    /// <summary>
    /// Get all available races for character creation
    /// </summary>
    [HttpGet("races")]
    [AllowAnonymous]
    public ActionResult<IReadOnlyCollection<RaceSelectionDto>> GetRaces()
    {
        var races = CharacterWizardService.GetAvailableRaces();
        var result = races.Select(r => new RaceSelectionDto(
            r.Name,
            r.Description,
            r.Speed,
            r.Languages,
            r.AbilityBonuses,
            r.Traits,
            CharacterWizardService.GetSubracesForRace(r.Name).Count > 0
        )).ToList();

        return Ok(result);
    }

    /// <summary>
    /// Get subraces for a specific race
    /// </summary>
    [HttpGet("races/{raceName}/subraces")]
    [AllowAnonymous]
    public ActionResult<IReadOnlyCollection<SubraceData>> GetSubraces(string raceName)
    {
        var subraces = CharacterWizardService.GetSubracesForRace(raceName);
        if (!subraces.Any())
        {
            return Ok(new List<SubraceData>());
        }

        return Ok(subraces);
    }

    /// <summary>
    /// Get all available classes for character creation
    /// </summary>
    [HttpGet("classes")]
    [AllowAnonymous]
    public ActionResult<IReadOnlyCollection<ClassSelectionDto>> GetClasses()
    {
        var classes = CharacterWizardService.GetAvailableClasses();
        var result = classes.Select(c => new ClassSelectionDto(
            c.Name,
            c.Description,
            c.HitDice,
            c.ArmorProficiencies,
            c.WeaponProficiencies,
            c.ToolProficiencies,
            c.SkillChoices,
            c.AllAvailableSkills
        )).ToList();

        return Ok(result);
    }

    /// <summary>
    /// Get specific class details
    /// </summary>
    [HttpGet("classes/{className}")]
    [AllowAnonymous]
    public ActionResult<ClassSelectionDto> GetClass(string className)
    {
        var classData = CharacterCreationDatabase.GetClass(className);
        if (classData == null)
        {
            return NotFound($"Class '{className}' not found.");
        }

        var result = new ClassSelectionDto(
            classData.Name,
            classData.Description,
            classData.HitDice,
            classData.ArmorProficiencies,
            classData.WeaponProficiencies,
            classData.ToolProficiencies,
            classData.SkillChoices,
            classData.AllAvailableSkills
        );

        return Ok(result);
    }

    /// <summary>
    /// Create a new character using the wizard flow
    /// </summary>
    [HttpPost("create")]
    [Authorize]
    public async Task<ActionResult<CharacterResponse>> CreateWithWizard(
        [FromBody] CreateCharacterWizardRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        // Validate input
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("Character name is required.");
        }

        // Validate race
        var race = CharacterCreationDatabase.GetRace(request.Race);
        if (race == null)
        {
            return BadRequest($"Invalid race: {request.Race}");
        }

        // Validate subrace if provided
        if (!string.IsNullOrEmpty(request.Subrace))
        {
            var subraces = CharacterWizardService.GetSubracesForRace(request.Race);
            if (!subraces.Any(s => s.Name.Equals(request.Subrace, StringComparison.OrdinalIgnoreCase)))
            {
                return BadRequest($"Invalid subrace: {request.Subrace}");
            }
        }

        // Validate class
        var classData = CharacterCreationDatabase.GetClass(request.Class);
        if (classData == null)
        {
            return BadRequest($"Invalid class: {request.Class}");
        }

        // Validate ability scores (point-buy)
        var pointBuy = CharacterCreation.Application.Validation.FiveEPointBuyValidator.Validate(
            request.Strength,
            request.Dexterity,
            request.Constitution,
            request.Intelligence,
            request.Wisdom,
            request.Charisma);

        if (!pointBuy.IsValid)
        {
            return BadRequest(pointBuy.Error);
        }

        // Validate skills
        if (!CharacterWizardService.ValidateSkillSelection(request.Class, request.SelectedSkills))
        {
            return BadRequest("Invalid skill selection for class.");
        }

        // Create character
        var character = new Character
        {
            Name = request.Name.Trim(),
            UserId = userId,
            Strength = request.Strength,
            Dexterity = request.Dexterity,
            Constitution = request.Constitution,
            Intelligence = request.Intelligence,
            Wisdom = request.Wisdom,
            Charisma = request.Charisma
        };

        // Apply race
        try
        {
            CharacterWizardService.ApplyRace(character, request.Race, request.Subrace);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }

        // Apply class
        try
        {
            CharacterWizardService.ApplyClass(character, request.Class);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }

        // Apply skills
        CharacterWizardService.ApplySkills(character, request.SelectedSkills);

        // Save to database
        dbContext.Characters.Add(character);
        await dbContext.SaveChangesAsync();

        return CreatedAtAction("GetById", "Characters", new { id = character.Id }, 
            Map(character));
    }

    private static CharacterResponse Map(Character character)
    {
        return new CharacterResponse(
            character.Id,
            character.Name,
            character.Race,
            character.Class,
            character.Level,
            character.Strength,
            character.Dexterity,
            character.Constitution,
            character.Intelligence,
            character.Wisdom,
            character.Charisma);
    }
}
