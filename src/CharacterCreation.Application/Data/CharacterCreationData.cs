namespace CharacterCreation.Application.Data;

/// <summary>
/// Represents a race with its bonuses, languages, and traits
/// </summary>
public sealed record RaceData(
    string Name,
    string Description,
    int Speed,
    List<string> Languages,
    List<AbilityBonusDto> AbilityBonuses,
    List<string> Traits
);

/// <summary>
/// Represents a subrace for races that have subraces
/// </summary>
public sealed record SubraceData(
    string Name,
    string Description,
    List<AbilityBonusDto> AdditionalAbilityBonuses,
    List<string> AdditionalLanguages,
    List<string> AdditionalTraits
);

/// <summary>
/// Represents a class with hit dice, proficiencies, and available skills
/// </summary>
public sealed record ClassData(
    string Name,
    string Description,
    string HitDice, // e.g., "1d12", "1d10", "1d8", "1d6"
    List<string> ArmorProficiencies,
    List<string> WeaponProficiencies,
    List<string> ToolProficiencies,
    List<string> SavingThrowProficiencies,
    List<SkillChoiceDto> SkillChoices, // e.g., "Choose 2 from 10 available skills"
    List<string> AllAvailableSkills,
    List<string> StartingEquipmentOptions
);

/// <summary>
/// Ability score bonus for a specific ability
/// </summary>
public sealed record AbilityBonusDto(string Ability, int Bonus);

/// <summary>
/// Skill choice configuration
/// </summary>
public sealed record SkillChoiceDto(int Count, List<string> AvailableSkills);

/// <summary>
/// Central repository for all character creation data
/// </summary>
public static class CharacterCreationDatabase
{
    private static readonly Dictionary<string, RaceData> RacesData = new(StringComparer.OrdinalIgnoreCase)
    {
        {
            "Human",
            new RaceData(
                "Human",
                "Humans are versatile and ambitious. They tend to be natural leaders and explorers.",
                30,
                new List<string> { "Common" },
                new List<AbilityBonusDto>
                {
                    new("Strength", 1),
                    new("Dexterity", 1),
                    new("Constitution", 1),
                    new("Intelligence", 1),
                    new("Wisdom", 1),
                    new("Charisma", 1)
                },
                new List<string> { "Extra Ability Score Increase" }
            )
        },
        {
            "Elf",
            new RaceData(
                "Elf",
                "Elves are graceful, intelligent beings with a deep connection to nature. They live for centuries.",
                30,
                new List<string> { "Common", "Elvish" },
                new List<AbilityBonusDto>
                {
                    new("Dexterity", 2),
                    new("Intelligence", 1)
                },
                new List<string> { "Keen Senses", "Fey Ancestry", "Trance" }
            )
        },
        {
            "Dwarf",
            new RaceData(
                "Dwarf",
                "Dwarves are stout, strong folk known for their craftsmanship and resilience. They value honor and tradition.",
                25,
                new List<string> { "Common", "Dwarvish" },
                new List<AbilityBonusDto>
                {
                    new("Constitution", 2),
                    new("Wisdom", 1)
                },
                new List<string> { "Darkvision", "Dwarven Resilience", "Dwarven Combat Training" }
            )
        },
        {
            "Halfling",
            new RaceData(
                "Halfling",
                "Halflings are small, nimble folk with a love of adventure and comfort. They're known for their luck.",
                25,
                new List<string> { "Common", "Halfling" },
                new List<AbilityBonusDto>
                {
                    new("Dexterity", 2),
                    new("Charisma", 1)
                },
                new List<string> { "Lucky", "Brave", "Halfling Nimbleness" }
            )
        },
        {
            "Dragonborn",
            new RaceData(
                "Dragonborn",
                "Dragonborn are draconic humanoids with a proud heritage. They are natural warriors with draconic breath.",
                30,
                new List<string> { "Common", "Draconic" },
                new List<AbilityBonusDto>
                {
                    new("Strength", 2),
                    new("Charisma", 1)
                },
                new List<string> { "Draconic Ancestry", "Breath Weapon", "Damage Resistance" }
            )
        },
        {
            "Gnome",
            new RaceData(
                "Gnome",
                "Gnomes are small, clever folk with a love of tinkering and innovation. They have a curious nature.",
                25,
                new List<string> { "Common", "Gnomish" },
                new List<AbilityBonusDto>
                {
                    new("Intelligence", 2),
                    new("Dexterity", 1)
                },
                new List<string> { "Darkvision", "Gnome Cunning" }
            )
        },
        {
            "Half-Elf",
            new RaceData(
                "Half-Elf",
                "Half-elves inherit the grace of their elven parents and adaptability of humans. They make excellent diplomats.",
                30,
                new List<string> { "Common", "Elvish" },
                new List<AbilityBonusDto>
                {
                    new("Charisma", 2)
                },
                new List<string> { "Fey Ancestry", "Skill Versatility" }
            )
        },
        {
            "Half-Orc",
            new RaceData(
                "Half-Orc",
                "Half-orcs are strong and fierce, often misunderstood but capable of great heroism.",
                30,
                new List<string> { "Common", "Orc" },
                new List<AbilityBonusDto>
                {
                    new("Strength", 2),
                    new("Constitution", 1),
                    new("Intelligence", -1)
                },
                new List<string> { "Darkvision", "Menacing", "Relentless Endurance" }
            )
        },
        {
            "Tiefling",
            new RaceData(
                "Tiefling",
                "Tieflings are descended from humans with infernal heritage. They possess dark charm and mysterious power.",
                30,
                new List<string> { "Common", "Infernal" },
                new List<AbilityBonusDto>
                {
                    new("Charisma", 2),
                    new("Intelligence", 1)
                },
                new List<string> { "Darkvision", "Hellish Resistance", "Infernal Legacy" }
            )
        }
    };

    private static readonly Dictionary<string, List<SubraceData>> SubracesData =
        new(StringComparer.OrdinalIgnoreCase)
        {
            {
                "Elf",
                new List<SubraceData>
                {
                    new(
                        "High Elf",
                        "High elves value magic and study. They are keen-minded and perceptive.",
                        new List<AbilityBonusDto> { new("Intelligence", 1) },
                        new List<string>(),
                        new List<string> { "Elf Weapon Training", "Cantrip" }
                    ),
                    new(
                        "Wood Elf",
                        "Wood elves roam forests and grasslands. They are fast and stealthy.",
                        new List<AbilityBonusDto> { new("Wisdom", 1) },
                        new List<string>(),
                        new List<string> { "Elf Weapon Training", "Fleet of Foot" }
                    ),
                    new(
                        "Dark Elf (Drow)",
                        "Drow are wicked and cruel. They dwell in the Underdark with innate magical abilities.",
                        new List<AbilityBonusDto> { new("Charisma", 1) },
                        new List<string>(),
                        new List<string> { "Superior Darkvision", "Sunlight Sensitivity", "Drow Magic" }
                    )
                }
            },
            {
                "Dwarf",
                new List<SubraceData>
                {
                    new(
                        "Mountain Dwarf",
                        "Mountain dwarves are strong and sturdy. They excel with armor and weapons.",
                        new List<AbilityBonusDto> { new("Strength", 1) },
                        new List<string>(),
                        new List<string> { "Armor Mastery" }
                    ),
                    new(
                        "Hill Dwarf",
                        "Hill dwarves are tough and enduring. They are natural miners and builders.",
                        new List<AbilityBonusDto> { new("Constitution", 1) },
                        new List<string>(),
                        new List<string> { "Tough", "Craftiness" }
                    )
                }
            }
        };

    private static readonly Dictionary<string, ClassData> ClassesData =
        new(StringComparer.OrdinalIgnoreCase)
        {
            {
                "Barbarian",
                new ClassData(
                    "Barbarian",
                    "Barbarians are fierce warriors who harness their rage to achieve incredible feats.",
                    "1d12",
                    new List<string> { "Simple Weapons", "Martial Weapons" },
                    new List<string>(),
                    new List<string>(),
                    new List<string> { "Strength", "Constitution" },
                    new List<SkillChoiceDto>
                    {
                        new(2,
                            new List<string>
                            {
                                "Animal Handling", "Athletics", "Intimidation", "Nature", "Perception",
                                "Survival"
                            })
                    },
                    new List<string>
                    {
                        "Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"
                    },
                    new List<string> { "Greataxe", "Martial Melee Weapons" }
                )
            },
            {
                "Bard",
                new ClassData(
                    "Bard",
                    "Bards are charismatic performers who weave magic into their music and words.",
                    "1d8",
                    new List<string> { "Light Armor" },
                    new List<string> { "Simple Weapons", "Hand Crossbows", "Longswords", "Rapiers" },
                    new List<string> { "Musical Instruments" },
                    new List<string> { "Charisma", "Dexterity" },
                    new List<SkillChoiceDto>
                    {
                        new(3,
                            new List<string>
                            {
                                "Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception",
                                "History", "Insight", "Intimidation", "Investigation", "Medicine",
                                "Nature", "Perception", "Performance", "Persuasion", "Religion",
                                "Sleight of Hand", "Stealth", "Survival"
                            })
                    },
                    new List<string>
                    {
                        "Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History",
                        "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception",
                        "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"
                    },
                    new List<string> { "Rapier", "Dagger" }
                )
            },
            {
                "Cleric",
                new ClassData(
                    "Cleric",
                    "Clerics are divine spellcasters and holy warriors blessed by their deity.",
                    "1d8",
                    new List<string> { "Light Armor", "Medium Armor", "Shields" },
                    new List<string> { "Simple Weapons" },
                    new List<string>(),
                    new List<string> { "Wisdom", "Charisma" },
                    new List<SkillChoiceDto>
                    {
                        new(2,
                            new List<string>
                            {
                                "Insight", "Medicine", "Persuasion", "Religion"
                            })
                    },
                    new List<string> { "Insight", "Medicine", "Persuasion", "Religion" },
                    new List<string> { "Mace", "Light Armor", "Shield" }
                )
            },
            {
                "Druid",
                new ClassData(
                    "Druid",
                    "Druids are nature spellcasters with a deep connection to the natural world.",
                    "1d8",
                    new List<string> { "Light Armor", "Medium Armor", "Shields (non-metal)" },
                    new List<string> { "Simple Melee Weapons", "Simple Ranged Weapons" },
                    new List<string>(),
                    new List<string> { "Intelligence", "Wisdom" },
                    new List<SkillChoiceDto>
                    {
                        new(2,
                            new List<string>
                            {
                                "Arcana", "Animal Handling", "Insight", "Medicine", "Nature", "Perception",
                                "Religion", "Survival"
                            })
                    },
                    new List<string>
                    {
                        "Arcana", "Animal Handling", "Insight", "Medicine", "Nature", "Perception",
                        "Religion", "Survival"
                    },
                    new List<string> { "Wooden Shield", "Scimitar", "Simple Weapons" }
                )
            },
            {
                "Fighter",
                new ClassData(
                    "Fighter",
                    "Fighters are master warriors trained in combat techniques and weaponry.",
                    "1d10",
                    new List<string> { "All Armor", "Shields" },
                    new List<string> { "Simple Weapons", "Martial Weapons" },
                    new List<string>(),
                    new List<string> { "Strength", "Constitution" },
                    new List<SkillChoiceDto>
                    {
                        new(2,
                            new List<string>
                            {
                                "Acrobatics", "Animal Handling", "Athletics", "History", "Insight",
                                "Intimidation", "Perception", "Survival"
                            })
                    },
                    new List<string>
                    {
                        "Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation",
                        "Perception", "Survival"
                    },
                    new List<string> { "Longsword", "Greatsword", "Martial Weapons" }
                )
            },
            {
                "Monk",
                new ClassData(
                    "Monk",
                    "Monks are disciplined martial artists who harness their inner energy.",
                    "1d8",
                    new List<string>(),
                    new List<string> { "Simple Weapons", "Shortswords" },
                    new List<string>(),
                    new List<string> { "Strength", "Dexterity" },
                    new List<SkillChoiceDto>
                    {
                        new(2,
                            new List<string>
                            {
                                "Acrobatics", "Athletics", "History", "Insight", "Religion", "Stealth"
                            })
                    },
                    new List<string> { "Acrobatics", "Athletics", "History", "Insight", "Religion", "Stealth" },
                    new List<string> { "Shortsword", "Simple Weapons" }
                )
            },
            {
                "Paladin",
                new ClassData(
                    "Paladin",
                    "Paladins are holy warriors bound by an oath to a sacred cause.",
                    "1d10",
                    new List<string> { "All Armor", "Shields" },
                    new List<string> { "Simple Weapons", "Martial Weapons" },
                    new List<string>(),
                    new List<string> { "Wisdom", "Charisma" },
                    new List<SkillChoiceDto>
                    {
                        new(2,
                            new List<string>
                            {
                                "Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"
                            })
                    },
                    new List<string>
                    {
                        "Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"
                    },
                    new List<string> { "Longsword", "Shield", "Holy Symbol" }
                )
            },
            {
                "Ranger",
                new ClassData(
                    "Ranger",
                    "Rangers are wilderness warriors skilled with bow and blade.",
                    "1d10",
                    new List<string> { "Light Armor", "Medium Armor" },
                    new List<string> { "Simple Weapons", "Martial Weapons" },
                    new List<string>(),
                    new List<string> { "Strength", "Dexterity" },
                    new List<SkillChoiceDto>
                    {
                        new(3,
                            new List<string>
                            {
                                "Acrobatics", "Animal Handling", "Athletics", "Insight", "Investigation",
                                "Nature", "Perception", "Stealth", "Survival"
                            })
                    },
                    new List<string>
                    {
                        "Acrobatics", "Animal Handling", "Athletics", "Insight", "Investigation", "Nature",
                        "Perception", "Stealth", "Survival"
                    },
                    new List<string> { "Longsword", "Shortbow", "Light Armor" }
                )
            },
            {
                "Rogue",
                new ClassData(
                    "Rogue",
                    "Rogues are cunning and stealthy, masters of deception and precision.",
                    "1d8",
                    new List<string> { "Light Armor" },
                    new List<string> { "Simple Weapons", "Hand Crossbows", "Longswords", "Rapiers", "Shortswords" },
                    new List<string> { "Thieves' Tools" },
                    new List<string> { "Dexterity", "Intelligence" },
                    new List<SkillChoiceDto>
                    {
                        new(4,
                            new List<string>
                            {
                                "Acrobatics", "Athletics", "Deception", "Insight", "Intimidation",
                                "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand",
                                "Stealth"
                            })
                    },
                    new List<string>
                    {
                        "Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation",
                        "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"
                    },
                    new List<string> { "Shortsword", "Shortbow", "Burglar's Pack" }
                )
            },
            {
                "Sorcerer",
                new ClassData(
                    "Sorcerer",
                    "Sorcerers are innate spellcasters with raw magical power flowing through their veins.",
                    "1d6",
                    new List<string>(),
                    new List<string> { "Daggers", "Darts", "Slings", "Quarterstaffs", "Light Crossbows" },
                    new List<string>(),
                    new List<string> { "Charisma", "Dexterity" },
                    new List<SkillChoiceDto>
                    {
                        new(2,
                            new List<string>
                            {
                                "Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"
                            })
                    },
                    new List<string> { "Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion" },
                    new List<string> { "Light Crossbow", "Simple Weapons" }
                )
            },
            {
                "Warlock",
                new ClassData(
                    "Warlock",
                    "Warlocks have made dark pacts to gain eldritch power beyond imagination.",
                    "1d8",
                    new List<string> { "Light Armor" },
                    new List<string> { "Simple Weapons" },
                    new List<string>(),
                    new List<string> { "Wisdom", "Charisma" },
                    new List<SkillChoiceDto>
                    {
                        new(2,
                            new List<string>
                            {
                                "Arcana", "Deception", "History", "Insight", "Investigation", "Nature",
                                "Religion"
                            })
                    },
                    new List<string>
                    {
                        "Arcana", "Deception", "History", "Insight", "Investigation", "Nature", "Religion"
                    },
                    new List<string> { "Light Crossbow", "Simple Weapons" }
                )
            },
            {
                "Wizard",
                new ClassData(
                    "Wizard",
                    "Wizards are scholars of the arcane arts, masters of spells and magical theory.",
                    "1d6",
                    new List<string>(),
                    new List<string> { "Daggers", "Darts", "Slings", "Quarterstaffs", "Light Crossbows" },
                    new List<string>(),
                    new List<string> { "Intelligence", "Wisdom" },
                    new List<SkillChoiceDto>
                    {
                        new(2,
                            new List<string>
                            {
                                "Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"
                            })
                    },
                    new List<string> { "Arcana", "History", "Insight", "Investigation", "Medicine", "Religion" },
                    new List<string> { "Quarterstaff", "Dagger", "Spellbook" }
                )
            }
        };

    public static RaceData? GetRace(string raceName)
    {
        return RacesData.TryGetValue(raceName, out var race) ? race : null;
    }

    public static List<RaceData> GetAllRaces()
    {
        return RacesData.Values.ToList();
    }

    public static List<SubraceData> GetSubraces(string raceName)
    {
        return SubracesData.TryGetValue(raceName, out var subraces) ? subraces : new List<SubraceData>();
    }

    public static ClassData? GetClass(string className)
    {
        return ClassesData.TryGetValue(className, out var classData) ? classData : null;
    }

    public static List<ClassData> GetAllClasses()
    {
        return ClassesData.Values.ToList();
    }
}
