using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CharacterCreation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ExpandCharacterEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Subrace",
                table: "Characters",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Speed",
                table: "Characters",
                type: "int",
                nullable: false,
                defaultValue: 30);

            migrationBuilder.AddColumn<string>(
                name: "HitDice",
                table: "Characters",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "1d10");

            migrationBuilder.AddColumn<int>(
                name: "MaxHitPoints",
                table: "Characters",
                type: "int",
                nullable: false,
                defaultValue: 10);

            migrationBuilder.AddColumn<int>(
                name: "CurrentHitPoints",
                table: "Characters",
                type: "int",
                nullable: false,
                defaultValue: 10);

            migrationBuilder.AddColumn<string>(
                name: "Skills",
                table: "Characters",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<string>(
                name: "Languages",
                table: "Characters",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<string>(
                name: "Proficiencies",
                table: "Characters",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<string>(
                name: "SavingThrowProficiencies",
                table: "Characters",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "[]");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Subrace",
                table: "Characters");

            migrationBuilder.DropColumn(
                name: "Speed",
                table: "Characters");

            migrationBuilder.DropColumn(
                name: "HitDice",
                table: "Characters");

            migrationBuilder.DropColumn(
                name: "MaxHitPoints",
                table: "Characters");

            migrationBuilder.DropColumn(
                name: "CurrentHitPoints",
                table: "Characters");

            migrationBuilder.DropColumn(
                name: "Skills",
                table: "Characters");

            migrationBuilder.DropColumn(
                name: "Languages",
                table: "Characters");

            migrationBuilder.DropColumn(
                name: "Proficiencies",
                table: "Characters");

            migrationBuilder.DropColumn(
                name: "SavingThrowProficiencies",
                table: "Characters");
        }
    }
}
