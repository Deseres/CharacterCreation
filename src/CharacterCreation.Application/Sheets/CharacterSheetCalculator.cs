using CharacterCreation.Domain.Entities;

namespace CharacterCreation.Application.Sheets;

public static class CharacterSheetCalculator
{
    public static CharacterSheetDto Calculate(Character character)
    {
        var baseScores = new AbilityScoresDto(
            character.Strength,
            character.Dexterity,
            character.Constitution,
            character.Intelligence,
            character.Wisdom,
            character.Charisma);

        var modifiers = BuildModifiers(character);
        var totals = SumAbilityModifiers(modifiers);

        var finalScores = new AbilityScoresDto(
            baseScores.Strength + totals.Strength,
            baseScores.Dexterity + totals.Dexterity,
            baseScores.Constitution + totals.Constitution,
            baseScores.Intelligence + totals.Intelligence,
            baseScores.Wisdom + totals.Wisdom,
            baseScores.Charisma + totals.Charisma);

        var proficiencyBonus = CalculateProficiencyBonus(character.Level);
        var abilityModifiers = new AbilityScoresDto(
            CalculateAbilityModifier(finalScores.Strength),
            CalculateAbilityModifier(finalScores.Dexterity),
            CalculateAbilityModifier(finalScores.Constitution),
            CalculateAbilityModifier(finalScores.Intelligence),
            CalculateAbilityModifier(finalScores.Wisdom),
            CalculateAbilityModifier(finalScores.Charisma));

        return new CharacterSheetDto(
            character.Id,
            character.Name,
            character.Race,
            character.Class,
            character.Level,
            baseScores,
            modifiers,
            finalScores,
            abilityModifiers,
            proficiencyBonus);
    }

    private static int CalculateAbilityModifier(int score) => (int)Math.Floor((score - 10) / 2.0);

    private static int CalculateProficiencyBonus(int level)
    {
        var normalizedLevel = Math.Clamp(level, 1, 20);
        return 2 + ((normalizedLevel - 1) / 4);
    }

    private static AbilityScoresDto SumAbilityModifiers(IEnumerable<StatModifierDto> modifiers)
    {
        var strength = 0;
        var dexterity = 0;
        var constitution = 0;
        var intelligence = 0;
        var wisdom = 0;
        var charisma = 0;

        foreach (var modifier in modifiers)
        {
            switch (modifier.Ability)
            {
                case "Strength":
                    strength += modifier.Value;
                    break;
                case "Dexterity":
                    dexterity += modifier.Value;
                    break;
                case "Constitution":
                    constitution += modifier.Value;
                    break;
                case "Intelligence":
                    intelligence += modifier.Value;
                    break;
                case "Wisdom":
                    wisdom += modifier.Value;
                    break;
                case "Charisma":
                    charisma += modifier.Value;
                    break;
            }
        }

        return new AbilityScoresDto(strength, dexterity, constitution, intelligence, wisdom, charisma);
    }

    private static List<StatModifierDto> BuildModifiers(Character character)
    {
        var modifiers = new List<StatModifierDto>();
        modifiers.AddRange(GetRaceModifiers(character.Race));
        modifiers.AddRange(GetClassModifiers(character.Class));
        modifiers.AddRange(GetEquippedItemModifiers(character.InventoryItems));
        return modifiers;
    }

    private static IEnumerable<StatModifierDto> GetEquippedItemModifiers(IEnumerable<InventoryItem> items)
    {
        foreach (var item in items.Where(x => x.IsEquipped))
        {
            if (item.StrengthBonus != 0) yield return new StatModifierDto($"Item:{item.Name}", "Strength", item.StrengthBonus);
            if (item.DexterityBonus != 0) yield return new StatModifierDto($"Item:{item.Name}", "Dexterity", item.DexterityBonus);
            if (item.ConstitutionBonus != 0) yield return new StatModifierDto($"Item:{item.Name}", "Constitution", item.ConstitutionBonus);
            if (item.IntelligenceBonus != 0) yield return new StatModifierDto($"Item:{item.Name}", "Intelligence", item.IntelligenceBonus);
            if (item.WisdomBonus != 0) yield return new StatModifierDto($"Item:{item.Name}", "Wisdom", item.WisdomBonus);
            if (item.CharismaBonus != 0) yield return new StatModifierDto($"Item:{item.Name}", "Charisma", item.CharismaBonus);
        }
    }

    private static IEnumerable<StatModifierDto> GetRaceModifiers(string race)
    {
        return race.Trim().ToLowerInvariant() switch
        {
            "human" => new[]
            {
                new StatModifierDto("Race", "Strength", 1),
                new StatModifierDto("Race", "Dexterity", 1),
                new StatModifierDto("Race", "Constitution", 1),
                new StatModifierDto("Race", "Intelligence", 1),
                new StatModifierDto("Race", "Wisdom", 1),
                new StatModifierDto("Race", "Charisma", 1)
            },
            "elf" => new[]
            {
                new StatModifierDto("Race", "Dexterity", 2)
            },
            "dwarf" => new[]
            {
                new StatModifierDto("Race", "Constitution", 2)
            },
            "halfling" => new[]
            {
                new StatModifierDto("Race", "Dexterity", 2)
            },
            "dragonborn" => new[]
            {
                new StatModifierDto("Race", "Strength", 2),
                new StatModifierDto("Race", "Charisma", 1)
            },
            "gnome" => new[]
            {
                new StatModifierDto("Race", "Intelligence", 2)
            },
            "half-elf" => new[]
            {
                new StatModifierDto("Race", "Charisma", 2)
            },
            "half-orc" => new[]
            {
                new StatModifierDto("Race", "Strength", 2),
                new StatModifierDto("Race", "Constitution", 1)
            },
            "tiefling" => new[]
            {
                new StatModifierDto("Race", "Charisma", 2),
                new StatModifierDto("Race", "Intelligence", 1)
            },
            _ => Array.Empty<StatModifierDto>()
        };
    }

    private static IEnumerable<StatModifierDto> GetClassModifiers(string characterClass)
    {
        return characterClass.Trim().ToLowerInvariant() switch
        {
            "barbarian" => new[] { new StatModifierDto("Class", "Strength", 1) },
            "fighter" => new[] { new StatModifierDto("Class", "Strength", 1) },
            "paladin" => new[] { new StatModifierDto("Class", "Charisma", 1) },
            "ranger" => new[] { new StatModifierDto("Class", "Dexterity", 1) },
            "rogue" => new[] { new StatModifierDto("Class", "Dexterity", 1) },
            "wizard" => new[] { new StatModifierDto("Class", "Intelligence", 1) },
            "cleric" => new[] { new StatModifierDto("Class", "Wisdom", 1) },
            "druid" => new[] { new StatModifierDto("Class", "Wisdom", 1) },
            "bard" => new[] { new StatModifierDto("Class", "Charisma", 1) },
            "monk" => new[] { new StatModifierDto("Class", "Wisdom", 1) },
            "sorcerer" => new[] { new StatModifierDto("Class", "Charisma", 1) },
            "warlock" => new[] { new StatModifierDto("Class", "Charisma", 1) },
            _ => Array.Empty<StatModifierDto>()
        };
    }
}

public sealed record CharacterSheetDto(
    Guid CharacterId,
    string Name,
    string Race,
    string Class,
    int Level,
    AbilityScoresDto BaseScores,
    IReadOnlyCollection<StatModifierDto> AppliedModifiers,
    AbilityScoresDto FinalScores,
    AbilityScoresDto AbilityModifiers,
    int ProficiencyBonus);

public sealed record AbilityScoresDto(
    int Strength,
    int Dexterity,
    int Constitution,
    int Intelligence,
    int Wisdom,
    int Charisma);

public sealed record StatModifierDto(
    string Source,
    string Ability,
    int Value);
