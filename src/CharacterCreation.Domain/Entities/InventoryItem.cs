namespace CharacterCreation.Domain.Entities;

public sealed class InventoryItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CharacterId { get; set; }
    public Character? Character { get; set; }

    public string Name { get; set; } = string.Empty;
    public string ItemType { get; set; } = "Misc";
    public int Quantity { get; set; } = 1;

    public bool IsEquipped { get; set; }
    public string? EquippedSlot { get; set; }

    public int StrengthBonus { get; set; }
    public int DexterityBonus { get; set; }
    public int ConstitutionBonus { get; set; }
    public int IntelligenceBonus { get; set; }
    public int WisdomBonus { get; set; }
    public int CharismaBonus { get; set; }
}
