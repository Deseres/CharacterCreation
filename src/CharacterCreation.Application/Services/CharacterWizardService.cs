using CharacterCreation.Application.Data;
using CharacterCreation.Domain.Entities;

namespace CharacterCreation.Application.Services;

/// <summary>
/// Service for managing character creation wizard logic
/// </summary>
public static class CharacterWizardService
{
    /// <summary>
    /// Applies race bonuses, languages, and traits to a character
    /// </summary>
    public static void ApplyRace(Character character, string raceName, string? subraceName = null)
    {
        var raceData = CharacterCreationDatabase.GetRace(raceName);
        if (raceData == null)
            throw new InvalidOperationException($"Race '{raceName}' not found.");

        character.Race = raceName;
        character.Speed = raceData.Speed;
        character.Languages.AddRange(raceData.Languages);

        // Apply subrace if specified
        if (!string.IsNullOrEmpty(subraceName))
        {
            var subraces = CharacterCreationDatabase.GetSubraces(raceName);
            var subrace = subraces.FirstOrDefault(s => s.Name.Equals(subraceName, StringComparison.OrdinalIgnoreCase));
            if (subrace != null)
            {
                character.Subrace = subraceName;
                character.Languages.AddRange(subrace.AdditionalLanguages);
            }
        }
    }

    /// <summary>
    /// Applies class features, proficiencies, and hit dice to a character
    /// </summary>
    public static void ApplyClass(Character character, string className)
    {
        var classData = CharacterCreationDatabase.GetClass(className);
        if (classData == null)
            throw new InvalidOperationException($"Class '{className}' not found.");

        character.Class = className;
        character.HitDice = classData.HitDice;

        // Calculate HP based on hit dice and CON modifier
        var conModifier = (int)Math.Floor((character.Constitution - 10) / 2.0);
        var hpFromHitDice = int.Parse(classData.HitDice.Split('d')[1]) + conModifier;
        character.MaxHitPoints = Math.Max(1, hpFromHitDice);
        character.CurrentHitPoints = character.MaxHitPoints;

        // Add proficiencies
        character.Proficiencies.AddRange(classData.ArmorProficiencies);
        character.Proficiencies.AddRange(classData.WeaponProficiencies);
        character.Proficiencies.AddRange(classData.ToolProficiencies);
        character.SavingThrowProficiencies.AddRange(classData.SavingThrowProficiencies);
    }

    /// <summary>
    /// Applies selected skills to a character
    /// </summary>
    public static void ApplySkills(Character character, List<string> selectedSkills)
    {
        character.Skills.Clear();
        character.Skills.AddRange(selectedSkills);
    }

    /// <summary>
    /// Gets all available races for the wizard
    /// </summary>
    public static List<RaceData> GetAvailableRaces()
    {
        return CharacterCreationDatabase.GetAllRaces();
    }

    /// <summary>
    /// Gets all subraces for a given race
    /// </summary>
    public static List<SubraceData> GetSubracesForRace(string raceName)
    {
        return CharacterCreationDatabase.GetSubraces(raceName);
    }

    /// <summary>
    /// Gets all available classes for the wizard
    /// </summary>
    public static List<ClassData> GetAvailableClasses()
    {
        return CharacterCreationDatabase.GetAllClasses();
    }

    /// <summary>
    /// Gets skill choices for a specific class
    /// </summary>
    public static List<SkillChoiceDto> GetClassSkillChoices(string className)
    {
        var classData = CharacterCreationDatabase.GetClass(className);
        return classData?.SkillChoices ?? new List<SkillChoiceDto>();
    }

    /// <summary>
    /// Validates skill selection against class requirements
    /// </summary>
    public static bool ValidateSkillSelection(string className, List<string> selectedSkills)
    {
        var classData = CharacterCreationDatabase.GetClass(className);
        if (classData == null)
            return false;

        foreach (var choice in classData.SkillChoices)
        {
            if (selectedSkills.Count(s => choice.AvailableSkills.Contains(s)) < choice.Count)
                return false;
        }

        return true;
    }
}

/// <summary>
/// DTO for character wizard creation request
/// </summary>
public sealed record CreateCharacterWizardRequest(
    string Name,
    string Race,
    string? Subrace,
    string Class,
    int Strength,
    int Dexterity,
    int Constitution,
    int Intelligence,
    int Wisdom,
    int Charisma,
    List<string> SelectedSkills
);

/// <summary>
/// DTO for race selection response
/// </summary>
public sealed record RaceSelectionDto(
    string Name,
    string Description,
    int Speed,
    List<string> Languages,
    List<AbilityBonusDto> AbilityBonuses,
    List<string> Traits,
    bool HasSubraces
);

/// <summary>
/// DTO for class selection response
/// </summary>
public sealed record ClassSelectionDto(
    string Name,
    string Description,
    string HitDice,
    List<string> ArmorProficiencies,
    List<string> WeaponProficiencies,
    List<string> ToolProficiencies,
    List<SkillChoiceDto> SkillChoices,
    List<string> AllAvailableSkills
);
