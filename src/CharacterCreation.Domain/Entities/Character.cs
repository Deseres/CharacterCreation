namespace CharacterCreation.Domain.Entities;

public sealed class Character
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;

    public string Race { get; set; } = "Human";
    public string Class { get; set; } = "Fighter";
    public int Level { get; set; } = 1;

    public int Strength { get; set; } = 10;
    public int Dexterity { get; set; } = 10;
    public int Constitution { get; set; } = 10;
    public int Intelligence { get; set; } = 10;
    public int Wisdom { get; set; } = 10;
    public int Charisma { get; set; } = 10;

    public List<InventoryItem> InventoryItems { get; set; } = [];
}
