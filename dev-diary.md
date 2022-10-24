## Change game init to be from the actual beginning of game: let's build UI/UX!
- Hamburger menu nav
- update README?
- Draft army mini-game?
- Placement DragNDrop
- Order Markers DragNDrop
- unit rollover for Master Set 1
- Build abilities
- Build 2 spacer movement: The array of possible moves has items with 2 hexes, instead of 1
- STYLE

## scoretopiaGame / multi-games for server
The client still doesn't have a way, on the Play Page or App.tsx.GameClient, to determine which board to show (for different games)


# MS1 Thoughts
1. Water Clone
    - resurrection
        - self, d20 (15, 10 on water), after moving, instead of attacking
        - range 1
        - sameLevel: true
        
2. Explosion Special Attack
    - range: 7
    - attack: 3
    - explosive: 1, affects all figures adjacent to target
      - affectsSelf: true
      - oneAttackForAllAffected: true
      - LOS to affected? false
        
3. Range Enhancement
   - effect: +2 range
   - aura: 1
     - adjacent: true
     - auraCondition (race === Soulbourg) && (classType:Guard)
        
4. Counter Strike
    - onDefend: excess shields count as unblockable hits on adjacent attacker
      - normalAttacksOnly: true
      - exception: (classType === Samurai)
      - range: 0 (melee)

5. Thorian Speed
    - onDefend: cannot be targeted
      - normalAttacksOnly: true
      - range: 1+ (ranged)

6. Grapple Gun 25
    - special move: 
      - range:1
      - altitudeGain:25
      - disengage:false

7. Double Attack
    - numberOfAttacks: 2

8. Stealth Dodge
    - onDefend: one shield blocks all
    - blockDefense:true
    - range:1+ (ranged)
    - shieldsRequired:1
    - normalAttacksOnly:false

9. Berserker Charge
    - after moving, before attacking
    - d20: 15+, may move again

10. Ghost Walk
    - onMove
    - disengage
    - move through all (engaged/enemy) figures
        
11. Sword of Reckoning 4
    - onAttack: +4 dice
      - range: 0
        
12. Disengage
    - onDisengage: cancel

13. Zettian Targeting
    - onAttack: if 2nd target same as 1st target, +1 dice
        
14. Grenade Special Attack
    - special attack
    - range: 5
    - attack: 2
    - lob: 12
    - limitUsage:1/game
    - LOS-to-target:false
    - explosive: 1, affects all figures adjacent to target
      - affectsSelf: true
      - oneAttackForAllAffected: true
      - LOS to affected? false
        "desc": "Range 5. Lob 12. Attack 2. Use this power once per game. Start the game with a grenade marker on this card. Remove the marker to throw grenades. One at a time do the following with each Airborne Elite: Choose a figure to attack. No clear line of sight is needed. Any figures adjacent to the chosen figure are also affected by the Grenade Special Attack. Roll 2 attack dice once for all affected figures. Each figure rolls defense dice separately."
        
        "name": "The Drop",
        "desc": "Airborne Elite do not start the game on the battlefield. At the start of each round, before you place Order Markers, roll the 20-sided die. If you roll a 13 or higher you may place all 4 Airborne Elite figures on any empty spaces. You cannot place them adjacent to eachother or other figures or on glyphs."
        
        "name": "Attack Aura 1",
        "desc": "All friendly figures adjacent to Finn with a range of 1 add 1 die to their normal attack."
        
        "name": "Warrior's Attack Spirit 1",
        "desc": "When Finn is destroyed, place this figure on any unique Army Card. Finn's Spirit adds 1 to the normal attack number on that card."
        
        "name": "Warrior's Armor Spirit 1",
        "desc": "When Thorgrim is destroyed, place this figure on any unique Army Card. Thorgrim's Spirit adds 1 to the defense number on that card."
        
        "name": "Defensive Aura 1",
        "desc": "All friendly figures adjacent to Thorgrim add 1 die their defense."
        
        "name": "Defensive Aura",
        "desc": "All figures you control within 4 clear sight spaces of Raelin add 2 to their defensive dice. Raelin's Defensive Aura does not affect Raelin."
        
        "name": "Flying",
        "desc": "When counting spaces for Raelin's movement, ignore elevations. Raelin may fly over water without stopping, pass over figures without becoming engaged, and fly over obstacles such as ruins. When Raelin starts to fly, if she is engaged she will take any leaving engagement attacks."
        
        "name": "Fire Line Special Attack",
        "desc": "Range: Special. Attack: 4. Choose 8 spaces in a straight line from Mimring. All figures on those spaces who are in line of sight are affected by Mimring's Fire Line Special Attack. Roll 4 attack dice once for all affected figures. Affected figures roll defense dice seperately."
        
        "name": "Flying",
        "desc": "When counting spaces for Mimring's movement, ignore elevations. Mimring may fly over water without stopping, pass over figures without becoming engaged, and fly over obstacles such as ruins. When Mimring starts to fly, if he is engaged he will take any leaving engagement attacks."
        
        "name": "Mind Shackle 20",
        "desc": "After moving and before attacking, you may choose any unique figure adjacent to Ne-gok-sa. Roll the 20-sided die. If you roll a 20, take control of the chosen figure and that figure's Army Card. You now control that Army Card and all figures on it. Remove any Order Markers on this card. If Ne-gok-sa is destroyed, you retain control of any previously Mind Shackled Army Cards."
        
        "name": "Chomp",
        "desc": "Before attacking, choose one medium or small figure adjacent to Grimnak. If the chosen figure is a Squad figure, destroy it. If the chosen figure is a Hero figure, roll the 20-sided die. If you roll a 16 or higher, destroy the chosen Hero."
        
        "name": "Orc Warrior Enhancement",
        "desc": "All friendly Orc Warriors adjacent to Grimnak roll an additional attack die and an additional defense die."