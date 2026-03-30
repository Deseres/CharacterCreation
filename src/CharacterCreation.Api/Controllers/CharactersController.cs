using System.Security.Claims;
using CharacterCreation.Application.Sheets;
using CharacterCreation.Application.Validation;
using CharacterCreation.Domain.Entities;
using CharacterCreation.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CharacterCreation.Api.Controllers;

[ApiController]
[Authorize]
[Route("characters")]
public sealed class CharactersController(ApplicationDbContext dbContext) : ControllerBase
{
    private static readonly HashSet<string> AllowedRaces = new(StringComparer.OrdinalIgnoreCase)
    {
        "Human", "Elf", "Dwarf", "Halfling", "Dragonborn", "Gnome", "Half-Elf", "Half-Orc", "Tiefling"
    };

    private static readonly HashSet<string> AllowedClasses = new(StringComparer.OrdinalIgnoreCase)
    {
        "Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk",
        "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"
    };

    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<CharacterResponse>>> GetAll()
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var characters = await dbContext.Characters
            .Where(x => x.UserId == userId)
            .OrderBy(x => x.Name)
            .Select(character => new CharacterResponse(
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
                character.Charisma))
            .ToListAsync();

        return Ok(characters);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CharacterResponse>> GetById(Guid id)
    {
        var character = await GetOwnedCharacter(id);
        if (character is null)
        {
            return NotFound();
        }

        return Ok(Map(character));
    }

    [HttpGet("{id:guid}/sheet")]
    public async Task<ActionResult<CharacterSheetDto>> GetSheet(Guid id)
    {
        var character = await GetOwnedCharacter(id, includeInventory: true);
        if (character is null)
        {
            return NotFound();
        }

        var sheet = CharacterSheetCalculator.Calculate(character);
        return Ok(sheet);
    }

    [HttpPost]
    public async Task<ActionResult<CharacterResponse>> Create(CreateCharacterRequest request)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var trimmedName = request.Name.Trim();
        if (string.IsNullOrWhiteSpace(trimmedName))
        {
            return BadRequest("Character name is required.");
        }

        if (!AllowedRaces.Contains(request.Race))
        {
            return BadRequest("Unsupported race.");
        }

        if (!AllowedClasses.Contains(request.Class))
        {
            return BadRequest("Unsupported class.");
        }

        var pointBuy = FiveEPointBuyValidator.Validate(
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

        var character = new Character
        {
            Name = trimmedName,
            UserId = userId,
            Race = request.Race,
            Class = request.Class,
            Strength = request.Strength,
            Dexterity = request.Dexterity,
            Constitution = request.Constitution,
            Intelligence = request.Intelligence,
            Wisdom = request.Wisdom,
            Charisma = request.Charisma
        };

        dbContext.Characters.Add(character);
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = character.Id }, Map(character));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CharacterResponse>> Update(Guid id, UpdateCharacterRequest request)
    {
        var character = await GetOwnedCharacter(id);
        if (character is null)
        {
            return NotFound();
        }

        var trimmedName = request.Name.Trim();
        if (string.IsNullOrWhiteSpace(trimmedName))
        {
            return BadRequest("Character name is required.");
        }

        character.Name = trimmedName;
        await dbContext.SaveChangesAsync();

        return Ok(Map(character));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var character = await GetOwnedCharacter(id);
        if (character is null)
        {
            return NotFound();
        }

        dbContext.Characters.Remove(character);
        await dbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:guid}/race")]
    public async Task<ActionResult<CharacterResponse>> UpdateRace(Guid id, UpdateRaceRequest request)
    {
        var character = await GetOwnedCharacter(id);
        if (character is null)
        {
            return NotFound();
        }

        if (!AllowedRaces.Contains(request.Race))
        {
            return BadRequest("Unsupported race.");
        }

        character.Race = request.Race;
        await dbContext.SaveChangesAsync();

        return Ok(Map(character));
    }

    [HttpPut("{id:guid}/class")]
    public async Task<ActionResult<CharacterResponse>> UpdateClass(Guid id, UpdateClassRequest request)
    {
        var character = await GetOwnedCharacter(id);
        if (character is null)
        {
            return NotFound();
        }

        if (!AllowedClasses.Contains(request.Class))
        {
            return BadRequest("Unsupported class.");
        }

        character.Class = request.Class;
        await dbContext.SaveChangesAsync();

        return Ok(Map(character));
    }

    [HttpPut("{id:guid}/ability-scores")]
    public async Task<ActionResult<CharacterResponse>> UpdateAbilityScores(Guid id, UpdateAbilityScoresRequest request)
    {
        var character = await GetOwnedCharacter(id);
        if (character is null)
        {
            return NotFound();
        }

        var validation = FiveEPointBuyValidator.Validate(
            request.Strength,
            request.Dexterity,
            request.Constitution,
            request.Intelligence,
            request.Wisdom,
            request.Charisma);

        if (!validation.IsValid)
        {
            return BadRequest(validation.Error);
        }

        character.Strength = request.Strength;
        character.Dexterity = request.Dexterity;
        character.Constitution = request.Constitution;
        character.Intelligence = request.Intelligence;
        character.Wisdom = request.Wisdom;
        character.Charisma = request.Charisma;

        await dbContext.SaveChangesAsync();

        return Ok(Map(character));
    }

    [HttpGet("{id:guid}/inventory/items")]
    public async Task<ActionResult<IReadOnlyCollection<InventoryItemResponse>>> GetInventory(Guid id)
    {
        var character = await GetOwnedCharacter(id, includeInventory: true);
        if (character is null)
        {
            return NotFound();
        }

        var items = character.InventoryItems
            .OrderBy(x => x.Name)
            .Select(MapInventory)
            .ToList();

        return Ok(items);
    }

    [HttpPost("{id:guid}/inventory/items")]
    public async Task<ActionResult<InventoryItemResponse>> AddInventoryItem(Guid id, AddInventoryItemRequest request)
    {
        var character = await GetOwnedCharacter(id);
        if (character is null)
        {
            return NotFound();
        }

        var itemName = request.Name.Trim();
        if (string.IsNullOrWhiteSpace(itemName))
        {
            return BadRequest("Item name is required.");
        }

        if (request.Quantity < 1)
        {
            return BadRequest("Quantity must be at least 1.");
        }

        var item = new InventoryItem
        {
            CharacterId = character.Id,
            Name = itemName,
            ItemType = string.IsNullOrWhiteSpace(request.ItemType) ? "Misc" : request.ItemType.Trim(),
            Quantity = request.Quantity,
            StrengthBonus = request.StrengthBonus,
            DexterityBonus = request.DexterityBonus,
            ConstitutionBonus = request.ConstitutionBonus,
            IntelligenceBonus = request.IntelligenceBonus,
            WisdomBonus = request.WisdomBonus,
            CharismaBonus = request.CharismaBonus
        };

        dbContext.InventoryItems.Add(item);
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetInventory), new { id = character.Id }, MapInventory(item));
    }

    [HttpDelete("{id:guid}/inventory/items/{itemId:guid}")]
    public async Task<IActionResult> DeleteInventoryItem(Guid id, Guid itemId)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var item = await dbContext.InventoryItems
            .Include(x => x.Character)
            .FirstOrDefaultAsync(x => x.Id == itemId && x.CharacterId == id && x.Character != null && x.Character.UserId == userId);

        if (item is null)
        {
            return NotFound();
        }

        dbContext.InventoryItems.Remove(item);
        await dbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:guid}/equipment/{slot}")]
    public async Task<ActionResult<CharacterSheetDto>> EquipItem(Guid id, string slot, EquipItemRequest request)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var normalizedSlot = slot.Trim();
        if (string.IsNullOrWhiteSpace(normalizedSlot))
        {
            return BadRequest("Equipment slot is required.");
        }

        var character = await dbContext.Characters
            .Include(x => x.InventoryItems)
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (character is null)
        {
            return NotFound();
        }

        var targetItem = character.InventoryItems.FirstOrDefault(x => x.Id == request.ItemId);
        if (targetItem is null)
        {
            return NotFound("Item not found in this character inventory.");
        }

        foreach (var equipped in character.InventoryItems.Where(x => x.IsEquipped && string.Equals(x.EquippedSlot, normalizedSlot, StringComparison.OrdinalIgnoreCase)))
        {
            equipped.IsEquipped = false;
            equipped.EquippedSlot = null;
        }

        targetItem.IsEquipped = true;
        targetItem.EquippedSlot = normalizedSlot;

        await dbContext.SaveChangesAsync();

        var sheet = CharacterSheetCalculator.Calculate(character);
        return Ok(sheet);
    }

    [HttpDelete("{id:guid}/equipment/{slot}")]
    public async Task<ActionResult<CharacterSheetDto>> UnequipSlot(Guid id, string slot)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var normalizedSlot = slot.Trim();
        if (string.IsNullOrWhiteSpace(normalizedSlot))
        {
            return BadRequest("Equipment slot is required.");
        }

        var character = await dbContext.Characters
            .Include(x => x.InventoryItems)
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (character is null)
        {
            return NotFound();
        }

        foreach (var equipped in character.InventoryItems.Where(x => x.IsEquipped && string.Equals(x.EquippedSlot, normalizedSlot, StringComparison.OrdinalIgnoreCase)))
        {
            equipped.IsEquipped = false;
            equipped.EquippedSlot = null;
        }

        await dbContext.SaveChangesAsync();

        var sheet = CharacterSheetCalculator.Calculate(character);
        return Ok(sheet);
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

    private static InventoryItemResponse MapInventory(InventoryItem item)
    {
        return new InventoryItemResponse(
            item.Id,
            item.Name,
            item.ItemType,
            item.Quantity,
            item.IsEquipped,
            item.EquippedSlot,
            item.StrengthBonus,
            item.DexterityBonus,
            item.ConstitutionBonus,
            item.IntelligenceBonus,
            item.WisdomBonus,
            item.CharismaBonus);
    }

    private async Task<Character?> GetOwnedCharacter(Guid id, bool includeInventory = false)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return null;
        }

        var query = dbContext.Characters.AsQueryable();
        if (includeInventory)
        {
            query = query.Include(x => x.InventoryItems);
        }

        return await query.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
    }

    private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);
}

public sealed record CreateCharacterRequest(
    string Name,
    string Race = "Human",
    string Class = "Fighter",
    int Strength = 8,
    int Dexterity = 8,
    int Constitution = 8,
    int Intelligence = 8,
    int Wisdom = 8,
    int Charisma = 8);

public sealed record UpdateCharacterRequest(string Name);
public sealed record UpdateRaceRequest(string Race);
public sealed record UpdateClassRequest(string Class);

public sealed record UpdateAbilityScoresRequest(
    int Strength,
    int Dexterity,
    int Constitution,
    int Intelligence,
    int Wisdom,
    int Charisma);

public sealed record CharacterResponse(
    Guid Id,
    string Name,
    string Race,
    string Class,
    int Level,
    int Strength,
    int Dexterity,
    int Constitution,
    int Intelligence,
    int Wisdom,
    int Charisma);

public sealed record AddInventoryItemRequest(
    string Name,
    string ItemType = "Misc",
    int Quantity = 1,
    int StrengthBonus = 0,
    int DexterityBonus = 0,
    int ConstitutionBonus = 0,
    int IntelligenceBonus = 0,
    int WisdomBonus = 0,
    int CharismaBonus = 0);

public sealed record EquipItemRequest(Guid ItemId);

public sealed record InventoryItemResponse(
    Guid Id,
    string Name,
    string ItemType,
    int Quantity,
    bool IsEquipped,
    string? EquippedSlot,
    int StrengthBonus,
    int DexterityBonus,
    int ConstitutionBonus,
    int IntelligenceBonus,
    int WisdomBonus,
    int CharismaBonus);
