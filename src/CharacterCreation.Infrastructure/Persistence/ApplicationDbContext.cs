using CharacterCreation.Domain.Entities;
using CharacterCreation.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CharacterCreation.Infrastructure.Persistence;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Character> Characters => Set<Character>();
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Character>(entity =>
        {
            entity.ToTable("Characters");
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Name).HasMaxLength(100).IsRequired();
            entity.Property(x => x.UserId).HasMaxLength(450).IsRequired();
            entity.Property(x => x.Race).HasMaxLength(50).IsRequired();
            entity.Property(x => x.Class).HasMaxLength(50).IsRequired();

            entity.HasIndex(x => x.UserId);

            entity.HasMany(x => x.InventoryItems)
                .WithOne(x => x.Character)
                .HasForeignKey(x => x.CharacterId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<InventoryItem>(entity =>
        {
            entity.ToTable("InventoryItems");
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Name).HasMaxLength(100).IsRequired();
            entity.Property(x => x.ItemType).HasMaxLength(30).IsRequired();
            entity.Property(x => x.EquippedSlot).HasMaxLength(30);

            entity.HasIndex(x => x.CharacterId);
            entity.HasIndex(x => new { x.CharacterId, x.IsEquipped, x.EquippedSlot });
        });
    }
}
