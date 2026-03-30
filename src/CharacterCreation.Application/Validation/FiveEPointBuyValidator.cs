namespace CharacterCreation.Application.Validation;

public static class FiveEPointBuyValidator
{
    private static readonly Dictionary<int, int> ScoreCost = new()
    {
        [8] = 0,
        [9] = 1,
        [10] = 2,
        [11] = 3,
        [12] = 4,
        [13] = 5,
        [14] = 7,
        [15] = 9
    };

    public static (bool IsValid, string Error) Validate(
        int strength,
        int dexterity,
        int constitution,
        int intelligence,
        int wisdom,
        int charisma,
        int maxPoints = 27)
    {
        var scores = new[] { strength, dexterity, constitution, intelligence, wisdom, charisma };
        if (scores.Any(score => !ScoreCost.ContainsKey(score)))
        {
            return (false, "Each ability score must be between 8 and 15 for 5e point buy.");
        }

        var totalCost = scores.Sum(score => ScoreCost[score]);
        if (totalCost > maxPoints)
        {
            return (false, $"Point-buy total cost is {totalCost}, which exceeds the limit of {maxPoints}.");
        }

        return (true, string.Empty);
    }
}
