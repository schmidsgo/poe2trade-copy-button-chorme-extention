console.log("Content script loaded!");

// Function to process rows and attach click events to "Copy" buttons
function processRows() {
  const rows = document.querySelectorAll('.row');
  console.log(`Found ${rows.length} rows containing the target elements.`);

  rows.forEach((row) => {
    // Skip rows that have already been processed
    if (row.querySelector('.copy-processed')) return;

    // Find the existing "Copy" button
    const copyButton = row.querySelector('.copy');

    if (copyButton) {
      // Remove "hidden" class and make the button visible
      copyButton.classList.remove('hidden');
      copyButton.style.display = 'inline-block';

      // Mark the button as processed to prevent reprocessing
      copyButton.classList.add('copy-processed');

      // Add the click event listener
      copyButton.addEventListener('click', () => {
        // Extract relevant data
        const itemClass = row.querySelector('.property span')?.innerText.trim() || "Unknown Class";
        const itemName = row.querySelector('.itemHeader .itemName')?.innerText.trim() || "Unknown Name";
        const itemBase = row.querySelector('.itemHeader .typeLine')?.innerText.trim() || "Unknown Base";

        // Determine rarity based on the color of the item name
        let rarity = "Unknown Rarity";
        const itemNameElement = row.querySelector('.itemHeader .itemName');
        if (itemNameElement) {
        const color = getComputedStyle(itemNameElement).color; // Get the computed color in rgb format
        const hexColor = rgbToHex(color); // Convert rgb to hex
        console.log("Item Name Hex Color:", hexColor); // Debug the hex color

        // Map the hex color to a rarity type
        const rarityMap = {
            "#ffff77": "Rare",   // Yellow
            "#8888ff": "Magic",  // Blue
            "#c8c8c8": "Normal", // Gray
            "#af6025": "Unique"  // Orange
        };

        rarity = rarityMap[hexColor] || "Unknown Rarity"; // Fallback to "Unknown Rarity" if color is not mapped
        }

        // Extract quality, stats, and requirements
        const itemPropertiesElements = row.querySelectorAll('.property');
        const itemProperties = [];
        
        // Start from the second property (index 1) to exclude the first property
        itemPropertiesElements.forEach((mod, index) => {
          if (index > 0) { // Skip the first property (index 0)
            itemProperties.push(mod.innerText.trim());
          }
        });

        // Extract requirements
        const requirementsElement = row.querySelector('.requirements');
        let requirementsString = "";

        if (requirementsElement) {
            const level = requirementsElement.querySelector('[data-field="lvl"] span.colourDefault')?.innerText.trim();
            const str = requirementsElement.querySelector('[data-field="str"] span.colourDefault')?.innerText.trim();
            const dex = requirementsElement.querySelector('[data-field="dex"] span.colourDefault')?.innerText.trim();
            const int = requirementsElement.querySelector('[data-field="int"] span.colourDefault')?.innerText.trim();

            // Build the requirements string dynamically
            const requirements = [];
            if (level) requirements.push(`Level: ${level}`);
            if (str) requirements.push(`Str: ${str}`);
            if (dex) requirements.push(`Dex: ${dex}`);
            if (int) requirements.push(`Int: ${int}`);

            // Join the requirements into a single string
            if (requirements.length > 0) {
                requirementsString = `Requirements:\n${requirements.join(", ")}`;
            }
        }
        
        // Extract item level
        const itemLevel = row.querySelector('.itemLevel span')?.innerText.trim() || "Unknown Item Level";

        // Extract corrupted status (if present)
        const isCorrupted = row.querySelector('.unmet')?.innerText.trim() === "Corrupted" ? "Corrupted" : "";

        // Extract modifiers (implicit, explicit, pseudo)
        const modifiers = [];
        const implicitMods = row.querySelectorAll('.implicitMod');
        const explicitMods = row.querySelectorAll('.explicitMod');

        implicitMods.forEach((mod) => modifiers.push(mod.innerText.trim()));
        explicitMods.forEach((mod) => modifiers.push(mod.innerText.trim()));

        // Extract socket information
        const socketInfo = row.querySelector('.sockets')?.className.match(/numSockets(\d+)/); // Match "numSocketsX" where X is the socket count
        const numSockets = socketInfo ? parseInt(socketInfo[1], 10) : 0; // Extract socket count or default to 0

        // Format socket string
        const socketString = numSockets > 0 ? "S ".repeat(numSockets).trim() : ""; // Repeat "S" for each socket and trim trailing space

        // Extract socked mods
        const socketModsRaw = row.querySelectorAll('.runeMod');
        const socketMods = [];
        socketModsRaw.forEach((mod) => socketMods.push(mod.innerText.trim() + " (rune)"));
        
        // Build the formatted string
        let textToCopy = `
Item Class: ${itemClass}
Rarity: ${rarity}
${itemName}
${itemBase}
--------
${itemProperties.join("\n")}
${requirementsString ? `--------\n${requirementsString}` : ""}
${socketString ? `--------\nSockets: ${socketString}` : ""}
--------
${itemLevel}
${socketMods ? `--------\n${socketMods.join("\n")}` : ""}
--------
${modifiers.join("\n")}
${isCorrupted}
`.trim(); // Remove unnecessary whitespace at the start and end

        // Copy the formatted string to the clipboard
        navigator.clipboard.writeText(textToCopy)
          .then(() => console.log("Copied to clipboard:\n", textToCopy))
          .catch((err) => console.error("Failed to copy text:", err));
      });
    }
  });
}


function rgbToHex(rgb) {
    const result = rgb.match(/\d+/g); // Extract the numeric values from the rgb string
    const r = parseInt(result[0]).toString(16).padStart(2, "0");
    const g = parseInt(result[1]).toString(16).padStart(2, "0");
    const b = parseInt(result[2]).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`.toLowerCase(); // Return the hex value in lowercase
}

// Observe the DOM for dynamically added rows
const observer = new MutationObserver(() => {
  processRows(); // Process rows whenever the DOM changes
});

// Start observing the body for changes
observer.observe(document.body, { childList: true, subtree: true });



// div class="row" -> div class='middle' -> div class='itemPopupContainer newItemPopup poe2Popup rarePopup' -> div class='itemBoxContent' -> div class='itemBoxContent'

// Item Class: Bows
// Rarity: Rare
// Onslaught Song
// Advanced Zealot Bow
// --------
// Quality: +20% (augmented)
// Physical Damage: 167-256 (augmented)
// Critical Hit Chance: 5.00%
// Attacks per Second: 1.20
// --------
// Requirements:
// Level: 62
// Dex: 142
// --------
// Sockets: S S 
// --------
// Item Level: 79
// --------
// 60% increased Elemental Damage with Attacks (rune)
// --------
// 167% increased Physical Damage
// Adds 6 to 11 Physical Damage
// 77% increased Elemental Damage with Attacks
// Bow Attacks fire an additional Arrow
// +32 to Dexterity
// Gain 25 Mana per Enemy Killed
// --------
// Corrupted


// Item Class: Gloves
// Rarity: Unique
// Hand of Wisdom and Action
// Furtive Wraps
// --------
// Quality: +20% (augmented)
// Evasion Rating: 60 (augmented)
// Energy Shield: 23 (augmented)
// --------
// Requirements:
// Level: 52
// Dex: 46
// Int: 46
// --------
// Sockets: S 
// --------
// Item Level: 82
// --------
// +25 to Dexterity
// +18 to Intelligence
// 3% increased Attack Speed per 25 Dexterity
// Adds 1 to 10 Lightning Damage to Attacks per 10 Intelligence
// --------
// She thinks and we act.
// She acts and we think.
// Fragments of the whole that washes clean the skies.
// --------
// Corrupted


// Item Class: Quivers
// Rarity: Rare
// Sol Nails
// Sacral Quiver
// --------
// Requirements:
// Level: 60
// --------
// Item Level: 80
// --------
// Gain 3 Life per Enemy Hit with Attacks (implicit)
// --------
// Adds 19 to 32 Physical Damage to Attacks
// 31% increased Damage with Bow Skills
// 12% increased Projectile Speed
// +2 to Level of all Projectile Skills
// Gain 17 Life per Enemy Killed
// Gain 3 Mana per Enemy Killed
// --------
// Can only be equipped if you are wielding a Bow.
// --------
// Corrupted
