namespace CharacterCreation.Domain.Entities;

public sealed class Character
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;

    // Character Info
    public string Race { get; set; } = "Human";
    public string? Subrace { get; set; }
    public string Class { get; set; } = "Fighter";
    public int Level { get; set; } = 1;

    // Ability Scores
    public int Strength { get; set; } = 10;
    public int Dexterity { get; set; } = 10;
    public int Constitution { get; set; } = 10;
    public int Intelligence { get; set; } = 10;
    public int Wisdom { get; set; } = 10;
    public int Charisma { get; set; } = 10;

    // Character Details
    public int Speed { get; set; } = 30; // in feet
    public string HitDice { get; set; } = "1d10"; // e.g., "1d10", "1d8"
    public int MaxHitPoints { get; set; } = 10;
    public int CurrentHitPoints { get; set; } = 10;

    // Skills and Languages (JSON serialized or separate table)
    public List<string> Skills { get; set; } = []; // e.g., ["Acrobatics", "Animal Handling"]
    public List<string> Languages { get; set; } = []; // e.g., ["Common", "Elvish"]
    public List<string> Proficiencies { get; set; } = []; // e.g., ["Light Armor", "Shortsword"]

    // Saving Throw Proficiencies (JSON or separate table)
    public List<string> SavingThrowProficiencies { get; set; } = []; // e.g., ["Strength", "Dexterity"]

    // Inventory
    public List<InventoryItem> InventoryItems { get; set; } = [];
}
