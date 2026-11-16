/**
 * HELIXEDU Knowledge Base — the offline "Helix Engine".
 *
 * Real, curated curriculum content used by the study assistant when no paid
 * AI provider is connected. Every entry is genuine teaching material, so the
 * free mode is genuinely useful rather than a placeholder.
 */

export type KnowledgeTopic = {
  id: string;
  subject: string;
  title: string;
  keywords: string[];
  simple: string;
  deep: string[];
  keyPoints: string[];
  example: string;
  mistakes?: string[];
  story?: string;
  code?: { lang: string; code: string };
  practice?: string[];
};

export const KNOWLEDGE: KnowledgeTopic[] = [
  /* ----------------------------- MATHEMATICS ---------------------------- */
  {
    id: "fractions",
    subject: "mathematics",
    title: "Fractions",
    keywords: ["fraction", "fractions", "numerator", "denominator", "rational", "simplify fraction"],
    simple:
      "A fraction shows part of a whole. The bottom number (denominator) says how many equal parts the whole is split into, and the top number (numerator) says how many of those parts you have. So 3/4 means 3 parts out of 4 equal parts.",
    deep: [
      "A fraction a/b is a division statement: a divided by b. That single idea explains almost everything about fractions.",
      "To add or subtract fractions you need a common denominator, because you can only combine pieces of the same size. 1/2 + 1/3 becomes 3/6 + 2/6 = 5/6.",
      "To multiply fractions you multiply straight across: (a/b) × (c/d) = ac/bd. To divide, multiply by the reciprocal: (a/b) ÷ (c/d) = (a/b) × (d/c).",
      "Simplifying a fraction means dividing the numerator and denominator by their greatest common factor. 8/12 simplifies to 2/3 because GCD(8,12) = 4.",
      "An improper fraction has a numerator larger than its denominator (7/4). A mixed number writes the same value as a whole plus a fraction (1¾).",
    ],
    keyPoints: [
      "Denominator = total equal parts, numerator = parts taken.",
      "Addition/subtraction needs a common denominator.",
      "Multiplication: straight across. Division: flip and multiply.",
      "Simplify by dividing by the GCD of numerator and denominator.",
    ],
    example:
      "A pizza is cut into 8 slices. You eat 3. You have eaten 3/8 of the pizza and 5/8 is left. If a friend eats 2 more slices, together you ate 3/8 + 2/8 = 5/8.",
    mistakes: [
      "Adding denominators when adding fractions — never do this.",
      "Forgetting to flip the second fraction when dividing.",
    ],
    story:
      "Imagine a cosmic bakery where every cake is sliced into identical star-shaped pieces. If a cake has 12 pieces and you take 4, you hold 4/12 of the cake — which the baker simplifies to 1/3 so it fits on a smaller plate. Fractions are just the bakery's language for sharing fairly.",
    practice: [
      "Simplify 18/24.",
      "Add 2/5 + 1/3.",
      "Divide 3/4 by 2/5.",
    ],
  },
  {
    id: "linear-equations",
    subject: "mathematics",
    title: "Linear Equations in One Variable",
    keywords: ["linear equation", "solve for x", "algebra", "one variable", "balancing equation"],
    simple:
      "A linear equation has a variable raised only to the power 1, like 2x + 3 = 11. You solve it by doing the same thing to both sides until x is alone.",
    deep: [
      "The equals sign is a balance scale. Whatever you do to one side you must do to the other, or the scale tips.",
      "The goal is to isolate the variable. Undo addition with subtraction, undo multiplication with division.",
      "2x + 3 = 11 → subtract 3 from both sides → 2x = 8 → divide both sides by 2 → x = 4.",
      "If the variable appears on both sides, first collect the variable terms on one side and the plain numbers on the other.",
      "Always check your answer by substituting it back into the original equation.",
    ],
    keyPoints: [
      "Do the same operation on both sides.",
      "Collect variable terms on one side, constants on the other.",
      "Inverse operations undo each other.",
      "Substitute the answer back to check.",
    ],
    example:
      "A mobile plan costs ₹250 plus ₹3 per minute. If the bill is ₹430: 250 + 3m = 430, so 3m = 180 and m = 60 minutes.",
    mistakes: ["Applying an operation to only one side.", "Sign errors when moving terms across the equals sign."],
    story:
      "Picture a magic balance in a space station. On the left pan sit mystery cubes labelled x. On the right pan sit known weights. You may add or remove identical weights from both pans — that is all algebra is — until only the mystery cubes remain, and then you can read their weight.",
    practice: ["Solve 5x - 7 = 18.", "Solve 3(x - 2) = 15.", "Solve x/4 + 1 = 5."],
  },
  {
    id: "pythagoras-theorem",
    subject: "mathematics",
    title: "Pythagoras Theorem",
    keywords: ["pythagoras", "pythagorean", "right triangle", "hypotenuse", "a2 + b2"],
    simple:
      "In any right-angled triangle, the square of the longest side (hypotenuse) equals the sum of the squares of the other two sides: a² + b² = c².",
    deep: [
      "The hypotenuse is always the side opposite the right angle, and it is always the longest side.",
      "Given the two shorter sides: c = √(a² + b²). Given the hypotenuse and one leg: a = √(c² - b²).",
      "The converse is also true: if a² + b² = c² for the three sides, the triangle must be right-angled.",
      "Common Pythagorean triples worth memorising: 3-4-5, 5-12-13, 8-15-17, 7-24-25, and their multiples.",
      "It extends to 3D: the space diagonal of a cuboid with sides l, w, h is √(l² + w² + h²).",
    ],
    keyPoints: [
      "Only valid for right-angled triangles.",
      "c is the hypotenuse, always opposite the 90° angle.",
      "c = √(a² + b²) to find the hypotenuse.",
      "a = √(c² - b²) to find a shorter side.",
    ],
    example:
      "A ladder 10 m long leans on a wall with its foot 6 m from the wall. Height = √(10² - 6²) = √(100 - 36) = √64 = 8 m.",
    mistakes: ["Putting the hypotenuse in the wrong place.", "Forgetting to take the square root at the end."],
    practice: ["Find the hypotenuse when the legs are 9 cm and 12 cm.", "A right triangle has hypotenuse 13 and one leg 5. Find the other."],
  },
  {
    id: "percentages",
    subject: "mathematics",
    title: "Percentage, Profit, Loss and Interest",
    keywords: ["percentage", "percent", "profit", "loss", "interest", "discount", "simple interest"],
    simple:
      "Percent means 'per hundred'. 15% = 15/100 = 0.15. To find 15% of 240, multiply 240 by 0.15.",
    deep: [
      "Percentage change = (change ÷ original value) × 100. Always divide by the original value, not the new one.",
      "Profit = Selling Price - Cost Price. Profit % = (Profit ÷ Cost Price) × 100.",
      "Loss = Cost Price - Selling Price. Loss % = (Loss ÷ Cost Price) × 100.",
      "Simple Interest = P × R × T ÷ 100, where P is principal, R is rate per year and T is time in years.",
      "Successive discounts do not add: two 10% discounts give 0.9 × 0.9 = 0.81, an effective 19% discount.",
    ],
    keyPoints: [
      "% = fraction × 100.",
      "Percentage change uses the original value as the base.",
      "Profit and loss percentages are always calculated on Cost Price.",
      "SI = P × R × T / 100.",
    ],
    example:
      "A book bought for ₹400 is sold for ₹460. Profit = ₹60, profit % = 60/400 × 100 = 15%.",
    mistakes: ["Using the selling price as the base for profit %.", "Adding successive percentages directly."],
    story:
      "A space merchant buys a crystal for 400 credits and sells it for 460. The 60 extra credits are the profit, and 15% of the original price is the merchant's 'growth rate'. Every price tag in the galaxy is just a percentage in disguise.",
    practice: ["Find 15% of 240.", "A shopkeeper sells at a loss of 12% on ₹2500. Find the selling price.", "SI on ₹5000 at 8% for 3 years."],
  },
  {
    id: "probability-basics",
    subject: "mathematics",
    title: "Probability Basics",
    keywords: ["probability", "chance", "dice", "coin", "outcome", "likelihood"],
    simple:
      "Probability measures how likely an event is. It is (number of favourable outcomes) ÷ (total number of equally likely outcomes), a value between 0 and 1.",
    deep: [
      "For equally likely outcomes, P(E) = n(E) / n(S), where S is the sample space.",
      "P(E) + P(not E) = 1. So the probability of something not happening is 1 - P(E).",
      "Rolling one die: 6 outcomes. Two dice: 36 outcomes. A coin: 2 outcomes. A deck of cards: 52.",
      "For independent events, P(A and B) = P(A) × P(B).",
      "Experimental probability approaches theoretical probability as the number of trials grows (law of large numbers).",
    ],
    keyPoints: [
      "0 ≤ P(E) ≤ 1.",
      "P(E) = favourable outcomes ÷ total outcomes.",
      "Complement rule: P(not E) = 1 - P(E).",
      "Multiply probabilities for independent 'and' events.",
    ],
    example:
      "Rolling a die, P(even number) = 3/6 = 1/2 because 2, 4 and 6 are favourable out of 6 outcomes.",
    mistakes: ["Counting outcomes that are not equally likely.", "Adding probabilities of independent events instead of multiplying."],
    practice: ["Find the probability of getting a head when a coin is tossed once.", "Two dice are rolled. Find P(sum = 7)."],
  },
  {
    id: "geometry-area",
    subject: "mathematics",
    title: "Area, Perimeter and Volume",
    keywords: ["area", "perimeter", "volume", "surface area", "circle", "triangle area", "cylinder"],
    simple:
      "Perimeter is the distance around a shape, area is the space inside it, and volume is the space inside a 3D object.",
    deep: [
      "Rectangle: perimeter = 2(l + b), area = l × b. Square: perimeter = 4s, area = s².",
      "Triangle: area = ½ × base × height. Heron's formula for three sides a, b, c: area = √(s(s-a)(s-b)(s-c)) where s = (a+b+c)/2.",
      "Circle: circumference = 2πr, area = πr².",
      "Cuboid: volume = l × b × h, surface area = 2(lb + bh + hl).",
      "Cylinder: volume = πr²h, curved surface area = 2πrh, total surface area = 2πr(r + h).",
      "Sphere: volume = (4/3)πr³, surface area = 4πr². Cone: volume = (1/3)πr²h.",
    ],
    keyPoints: [
      "Triangle area needs base and the perpendicular height.",
      "Circle area = πr², circumference = 2πr.",
      "Cuboid volume = l × b × h.",
      "Cylinder volume = πr²h, cone = one third of that.",
    ],
    example:
      "A cylindrical tank of radius 3.5 m and height 10 m holds π × 3.5² × 10 ≈ 385 m³ of water.",
    mistakes: ["Using a slanted side instead of the perpendicular height in a triangle.", "Confusing volume with surface area."],
    practice: ["Find the area of a triangle with base 12 cm and height 5 cm.", "Find the volume of a cylinder with r = 7 cm, h = 10 cm."],
  },
  {
    id: "quadratic-equations",
    subject: "mathematics",
    title: "Quadratic Equations",
    keywords: ["quadratic", "discriminant", "roots", "factorisation", "quadratic formula"],
    simple:
      "A quadratic equation has the form ax² + bx + c = 0 where a ≠ 0. You can solve it by factorising or by using the quadratic formula.",
    deep: [
      "Quadratic formula: x = (-b ± √(b² - 4ac)) / 2a.",
      "The discriminant D = b² - 4ac decides the nature of the roots.",
      "D > 0 → two distinct real roots. D = 0 → two equal real roots. D < 0 → no real roots.",
      "Sum of the roots = -b/a and product of the roots = c/a — a fast way to check factorisation.",
      "To factorise, find two numbers that multiply to a×c and add to b, then split the middle term.",
    ],
    keyPoints: [
      "Standard form first: ax² + bx + c = 0.",
      "D = b² - 4ac decides the nature of roots.",
      "Sum of roots = -b/a, product = c/a.",
      "A quadratic has at most 2 roots.",
    ],
    example:
      "x² - 5x + 6 = 0 → D = 25 - 24 = 1 → x = (5 ± 1)/2 → x = 3 or x = 2.",
    mistakes: ["Sign errors when a is negative.", "Forgetting that a cannot be zero."],
    practice: ["Solve x² - 7x + 12 = 0.", "Find the nature of the roots of 2x² + 4x + 5 = 0."],
  },
  {
    id: "trigonometry-basics",
    subject: "mathematics",
    title: "Introduction to Trigonometry",
    keywords: ["trigonometry", "sin", "cos", "tan", "right angle triangle", "trigonometric ratios"],
    simple:
      "Trigonometry relates the angles of a right-angled triangle to ratios of its sides: sin θ = opposite/hypotenuse, cos θ = adjacent/hypotenuse, tan θ = opposite/adjacent.",
    deep: [
      "Remember SOH-CAH-TOA: Sin = Opp/Hyp, Cos = Adj/Hyp, Tan = Opp/Adj.",
      "Standard values: sin 30° = 1/2, cos 30° = √3/2, tan 30° = 1/√3; sin 45° = cos 45° = 1/√2, tan 45° = 1; sin 60° = √3/2, cos 60° = 1/2, tan 60° = √3.",
      "Identity: sin²θ + cos²θ = 1. This is the most used identity in proofs.",
      "sin θ increases from 0 to 1 as θ goes from 0° to 90°, while cos θ decreases from 1 to 0.",
      "Applications: height and distance problems, engineering, navigation and physics.",
    ],
    keyPoints: [
      "SOH-CAH-TOA for right-angled triangles.",
      "sin 0° = 0, sin 90° = 1; cos 0° = 1, cos 90° = 0.",
      "sin²θ + cos²θ = 1.",
      "tan θ = sin θ / cos θ.",
    ],
    example:
      "A tree casts a shadow 10 m long when the sun's angle of elevation is 30°. Height = 10 × tan 30° = 10/√3 ≈ 5.77 m.",
    mistakes: ["Mixing up opposite and adjacent.", "Using the wrong identity in proofs."],
    practice: ["If sin θ = 3/5, find cos θ.", "Evaluate tan 45° + sin 30°."],
  },
  {
    id: "statistics-mean-median-mode",
    subject: "mathematics",
    title: "Mean, Median and Mode",
    keywords: ["mean", "median", "mode", "average", "statistics", "data handling"],
    simple:
      "Mean is the average, median is the middle value when data is ordered, and mode is the most frequent value.",
    deep: [
      "Mean = sum of all observations ÷ number of observations.",
      "To find the median, arrange the data in ascending order. For an odd count it is the middle value; for an even count it is the average of the two middle values.",
      "Mode is the observation with the highest frequency. A data set can have one mode, more than one mode, or no mode.",
      "The mean is affected by extreme values (outliers); the median is not. This is why 'average income' and 'typical income' can differ hugely.",
      "Range = largest value - smallest value, a simple measure of spread.",
    ],
    keyPoints: [
      "Mean uses all values; median uses position; mode uses frequency.",
      "Median needs sorted data.",
      "Mean is sensitive to outliers.",
      "Range = max - min.",
    ],
    example:
      "Marks: 12, 15, 15, 18, 20. Mean = 80/5 = 16, median = 15, mode = 15, range = 8.",
    practice: ["Find the mean of 4, 8, 6, 10, 2.", "Find the median of 3, 7, 9, 11, 15, 21."],
  },

  /* ------------------------------- SCIENCE ------------------------------ */
  {
    id: "photosynthesis",
    subject: "science",
    title: "Photosynthesis",
    keywords: ["photosynthesis", "chlorophyll", "chloroplast", "plant food", "light reaction", "calvin cycle"],
    simple:
      "Photosynthesis is how green plants make their own food using sunlight, water and carbon dioxide, releasing oxygen as a by-product.",
    deep: [
      "Overall equation: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂.",
      "It happens in the chloroplasts, mainly in the palisade cells of the leaf, using the green pigment chlorophyll which absorbs red and blue light and reflects green.",
      "Light-dependent reactions occur in the thylakoid membranes: water is split (photolysis), releasing O₂, and ATP and NADPH are produced.",
      "The Calvin cycle (light-independent) occurs in the stroma: CO₂ is fixed into glucose using ATP and NADPH.",
      "Three factors limit the rate: light intensity, carbon dioxide concentration and temperature.",
      "Almost all life on Earth depends on this process — it is the entry point of energy into food chains and the source of atmospheric oxygen.",
    ],
    keyPoints: [
      "Raw materials: CO₂, water, sunlight. Products: glucose + oxygen.",
      "Site: chloroplast; pigment: chlorophyll.",
      "Light reactions make ATP and NADPH; the Calvin cycle makes sugar.",
      "Limiting factors: light, CO₂, temperature.",
    ],
    example:
      "A hydrilla plant kept under a funnel in water releases bubbles of oxygen when placed in sunlight — a classic proof that oxygen is produced during photosynthesis.",
    mistakes: ["Saying plants 'breathe in' oxygen to make food — they take in CO₂.", "Confusing respiration with photosynthesis."],
    story:
      "Every leaf is a tiny solar factory. Chlorophyll molecules are the solar panels, water pipes bring in hydrogen from the soil, and carbon dioxide arrives from the air. The factory runs all day on sunlight and ships sugar down to the roots — and it gives away its waste product, oxygen, for free to the whole planet.",
    practice: ["Write the balanced equation for photosynthesis.", "Why do leaves look green?", "Name the two stages of photosynthesis."],
  },
  {
    id: "cell-structure",
    subject: "science",
    title: "Cell Structure and Function",
    keywords: ["cell", "organelle", "nucleus", "mitochondria", "prokaryotic", "eukaryotic", "ribosome"],
    simple:
      "The cell is the basic unit of life. Plant and animal cells are eukaryotic, with a true nucleus and membrane-bound organelles.",
    deep: [
      "Cell membrane: selectively permeable boundary that controls what enters and leaves.",
      "Nucleus: contains DNA and controls cell activities. Cytoplasm: jelly-like fluid where reactions occur.",
      "Mitochondria: site of aerobic respiration, produces ATP — the 'powerhouse of the cell'.",
      "Ribosomes: protein synthesis. Endoplasmic reticulum: transport and synthesis. Golgi apparatus: packaging and dispatch.",
      "Lysosomes contain digestive enzymes ('suicide bags'). Vacuoles store water and substances — large and permanent in plant cells.",
      "Plant cells additionally have a cell wall (cellulose), chloroplasts and a large central vacuole; animal cells have centrioles.",
      "Prokaryotic cells (bacteria) lack a membrane-bound nucleus; their DNA lies free in the cytoplasm.",
    ],
    keyPoints: [
      "Cell = structural and functional unit of life.",
      "Mitochondria → energy; ribosomes → protein; nucleus → control.",
      "Plant-only: cell wall, chloroplast, large vacuole.",
      "Prokaryotes have no true nucleus.",
    ],
    example:
      "Cheek cells (animal) are irregular and lack a cell wall, while onion peel cells (plant) are rectangular with a distinct cell wall — visible under a school microscope.",
    practice: ["Name three organelles and their functions.", "Give two differences between plant and animal cells."],
  },
  {
    id: "newtons-laws",
    subject: "science",
    title: "Newton's Laws of Motion",
    keywords: ["newton", "laws of motion", "inertia", "force", "momentum", "f=ma", "action reaction"],
    simple:
      "Newton's three laws describe how forces affect motion: objects keep doing what they are doing unless a force acts; force equals mass times acceleration; and every action has an equal and opposite reaction.",
    deep: [
      "First law (inertia): a body stays at rest or in uniform motion unless acted on by an external unbalanced force. Seatbelts exist because of inertia.",
      "Second law: F = ma. Force is measured in newtons; 1 N accelerates 1 kg at 1 m/s². Momentum p = mv, and force is the rate of change of momentum.",
      "Third law: forces always come in equal, opposite pairs acting on different bodies. A rocket pushes gas down; the gas pushes the rocket up.",
      "Mass is the amount of matter (constant), weight is the gravitational force on it (varies with g).",
      "Conservation of momentum: in the absence of external forces, total momentum before a collision equals total momentum after.",
    ],
    keyPoints: [
      "Law 1 = inertia. Law 2 = F = ma. Law 3 = action–reaction.",
      "Action and reaction act on different bodies, so they never cancel.",
      "Momentum p = mv; force = rate of change of momentum.",
      "1 N = 1 kg·m/s².",
    ],
    example:
      "A 2 kg box pushed with 10 N accelerates at a = F/m = 10/2 = 5 m/s².",
    mistakes: ["Thinking action and reaction cancel each other.", "Confusing mass with weight."],
    practice: ["Calculate the force needed to accelerate 5 kg at 3 m/s².", "Why does a passenger jerk forward when a bus stops suddenly?"],
  },
  {
    id: "periodic-table",
    subject: "science",
    title: "Periodic Table and Periodic Trends",
    keywords: ["periodic table", "mendeleev", "groups", "periods", "valency", "atomic number", "metalloids"],
    simple:
      "The periodic table arranges elements by increasing atomic number so that elements with similar properties line up in the same column (group).",
    deep: [
      "Modern periodic law: properties of elements are a periodic function of their atomic numbers.",
      "There are 18 groups (vertical columns) and 7 periods (horizontal rows).",
      "Across a period, atomic size decreases, ionisation energy increases and metallic character decreases.",
      "Down a group, atomic size increases and metallic character increases because new shells are added.",
      "Valency pattern for main-group elements: it increases 1→4 then decreases 4→1 across a period.",
      "Group 1 = alkali metals, Group 2 = alkaline earth metals, Group 17 = halogens, Group 18 = noble gases.",
      "Metals are on the left, non-metals on the right, and metalloids (B, Si, Ge, As, Sb, Te) form the staircase border.",
    ],
    keyPoints: [
      "Ordered by atomic number, not atomic mass.",
      "18 groups, 7 periods.",
      "Across a period: size ↓, metallic character ↓.",
      "Down a group: size ↑, metallic character ↑.",
    ],
    example:
      "Sodium (Na, Z = 11) and potassium (K, Z = 19) are both in Group 1 and both react vigorously with water — because they have the same number of valence electrons (1).",
    practice: ["Write the electronic configuration of chlorine (Z = 17).", "Why are noble gases inert?"],
  },
  {
    id: "states-of-matter",
    subject: "science",
    title: "States of Matter",
    keywords: ["solid", "liquid", "gas", "plasma", "melting", "evaporation", "sublimation", "latent heat"],
    simple:
      "Matter exists mainly as solids, liquids and gases, depending on how closely the particles are packed and how strongly they attract each other.",
    deep: [
      "Solids: fixed shape and volume, particles tightly packed in a regular pattern, only vibrate about fixed positions.",
      "Liquids: fixed volume, take the shape of the container, particles close but able to slide past each other.",
      "Gases: no fixed shape or volume, particles far apart and moving freely, highly compressible.",
      "Plasma is the fourth state — ionised gas found in stars and neon signs.",
      "Changing state needs latent heat: melting (solid→liquid), evaporation/boiling (liquid→gas), condensation (gas→liquid), freezing (liquid→solid), sublimation (solid→gas directly, e.g. camphor), deposition (gas→solid).",
      "Evaporation is a surface phenomenon that causes cooling because the fastest-moving particles escape.",
      "Pressure × Volume is constant for a fixed amount of gas at constant temperature (Boyle's law).",
    ],
    keyPoints: [
      "Particle arrangement decides the state.",
      "Interparticle space: solid < liquid < gas.",
      "Latent heat changes state without changing temperature.",
      "Evaporation causes cooling.",
    ],
    example:
      "Sweat evaporates from your skin, taking heat energy from your body — which is why you feel cooler after a workout.",
    practice: ["Define sublimation with an example.", "Why does a gas fill its container completely?"],
  },
  {
    id: "human-digestive-system",
    subject: "science",
    title: "Human Digestive System",
    keywords: ["digestion", "stomach", "enzyme", "amylase", "intestine", "absorption", "villi"],
    simple:
      "Digestion breaks food into small, soluble molecules that can be absorbed into the blood. It involves mechanical chewing and chemical enzyme action.",
    deep: [
      "Saliva contains salivary amylase, which begins starch digestion in the mouth; the tongue forms a bolus.",
      "The stomach mixes food with hydrochloric acid and pepsin; acid kills germs and gives pepsin the right pH to digest protein into peptides.",
      "Bile from the liver (stored in the gall bladder) emulsifies fat — it breaks large fat droplets into small ones, increasing surface area. It is an emulsifier, not an enzyme.",
      "The pancreas secretes pancreatic juice containing trypsin (protein), lipase (fat) and amylase (starch).",
      "The small intestine is the main site of digestion and absorption. Villi and microvilli massively increase surface area; absorbed nutrients pass into blood capillaries.",
      "The large intestine absorbs water and minerals, and the rectum stores waste.",
    ],
    keyPoints: [
      "Starch → maltose → glucose; protein → peptides → amino acids; fat → fatty acids + glycerol.",
      "Small intestine = main site of absorption.",
      "Bile emulsifies fat; it is not an enzyme.",
      "Villi increase the absorptive surface area.",
    ],
    example:
      "Roti is chewed and mixed with saliva, so amylase starts converting its starch into maltose even before it reaches the stomach.",
    practice: ["Name the enzyme that digests protein and where it is made.", "Why is the small intestine long and folded?"],
  },
  {
    id: "electricity-basics",
    subject: "science",
    title: "Electricity: Current, Voltage, Resistance",
    keywords: ["electricity", "ohm's law", "current", "voltage", "resistance", "circuit", "power"],
    simple:
      "Electric current is the flow of charge. Voltage pushes it, resistance opposes it, and Ohm's law says V = I × R.",
    deep: [
      "Current (I) is measured in amperes with an ammeter connected in series; voltage (V) in volts with a voltmeter in parallel.",
      "Ohm's law: V = IR, so I = V/R and R = V/I. Resistance is measured in ohms (Ω).",
      "Resistance of a wire depends on length (longer → more resistance), cross-sectional area (thicker → less), and material (resistivity).",
      "Resistors in series add: R = R₁ + R₂ + R₃. In parallel, 1/R = 1/R₁ + 1/R₂ + 1/R₃.",
      "Electric power P = VI = I²R = V²/R, measured in watts. Energy consumed = power × time, measured in kilowatt-hours (units).",
      "Heating effect (filament, heater) and magnetic effect (motors, bells) are the two main practical effects of current.",
    ],
    keyPoints: [
      "V = IR.",
      "Series: same current, voltages add, resistances add.",
      "Parallel: same voltage, currents add.",
      "1 kWh = 1 unit of electrical energy.",
    ],
    example:
      "A 100 W bulb used for 10 hours consumes 100 × 10 = 1000 Wh = 1 kWh = 1 unit of electricity.",
    mistakes: ["Connecting an ammeter in parallel (it shorts the circuit).", "Forgetting that parallel resistance is always less than the smallest resistor."],
    practice: ["Find the current when 12 V is applied across 4 Ω.", "Two 6 Ω resistors in parallel — find the equivalent resistance."],
  },
  {
    id: "chemical-reactions",
    subject: "science",
    title: "Types of Chemical Reactions",
    keywords: ["chemical reaction", "combination", "decomposition", "displacement", "redox", "oxidation", "endothermic"],
    simple:
      "A chemical reaction rearranges atoms to form new substances. Reactions are classified by what happens to the reactants.",
    deep: [
      "Combination: two or more substances form one product, e.g. CaO + H₂O → Ca(OH)₂.",
      "Decomposition: one compound breaks into simpler substances, e.g. 2FeSO₄ → Fe₂O₃ + SO₂ + SO₃ (heat).",
      "Displacement: a more reactive metal displaces a less reactive one, e.g. Zn + CuSO₄ → ZnSO₄ + Cu.",
      "Double displacement (precipitation): ions exchange, e.g. AgNO₃ + NaCl → AgCl↓ + NaNO₃.",
      "Oxidation is gain of oxygen or loss of hydrogen; reduction is the reverse. Redox reactions involve both together.",
      "Endothermic reactions absorb heat (e.g. decomposition of calcium carbonate); exothermic reactions release heat (e.g. combustion, neutralisation).",
      "A balanced equation has the same number of atoms of each element on both sides — mass is conserved.",
    ],
    keyPoints: [
      "Mass is always conserved in a chemical reaction.",
      "Combination, decomposition, displacement, double displacement.",
      "Corrosion and rancidity are everyday redox reactions.",
      "Endothermic absorbs heat; exothermic releases heat.",
    ],
    example:
      "A shiny iron nail left in blue copper sulphate solution turns brownish as copper deposits on it — iron displaces copper because iron is more reactive.",
    practice: ["Classify: CaCO₃ → CaO + CO₂.", "What is observed when zinc is added to copper sulphate solution?"],
  },
  {
    id: "human-circulatory-system",
    subject: "science",
    title: "Circulatory System and Blood",
    keywords: ["heart", "blood", "circulation", "artery", "vein", "haemoglobin", "double circulation"],
    simple:
      "The heart pumps blood through vessels to deliver oxygen and nutrients to cells and carry away waste.",
    deep: [
      "The human heart has four chambers: right atrium, right ventricle, left atrium, left ventricle.",
      "Double circulation: pulmonary (heart → lungs → heart) and systemic (heart → body → heart). This keeps oxygenated and deoxygenated blood separate, supporting the high energy needs of warm-blooded animals.",
      "Arteries carry blood away from the heart (thick, elastic walls, no valves except at the start); veins carry blood back (thin walls, valves to prevent backflow).",
      "Blood = plasma + red blood cells + white blood cells + platelets. Haemoglobin in RBCs carries oxygen.",
      "One heartbeat = one cardiac cycle: atria contract, then ventricles contract, then all chambers relax. Normal resting rate is 72–80 beats per minute.",
      "Platelets enable clotting; WBCs fight infection; plasma transports nutrients, hormones and waste.",
    ],
    keyPoints: [
      "Four-chambered heart; separation of oxygenated and deoxygenated blood.",
      "Arteries away from the heart, veins towards it.",
      "Haemoglobin carries oxygen.",
      "Double circulation = pulmonary + systemic.",
    ],
    example:
      "Because the left ventricle must pump blood to the whole body, its wall is much thicker than the right ventricle's, which only pumps to the lungs.",
    practice: ["Why does the left ventricle have a thicker wall?", "Name the valve between the left atrium and left ventricle."],
  },
  {
    id: "evolution-basics",
    subject: "science",
    title: "Heredity and Evolution",
    keywords: ["evolution", "darwin", "natural selection", "heredity", "mendel", "dominant", "speciation"],
    simple:
      "Evolution is the gradual change in heritable traits of populations over generations, driven mainly by natural selection.",
    deep: [
      "Mendel's laws: the law of dominance, the law of segregation and the law of independent assortment, established using pea plants.",
      "Dominant traits mask recessive ones. A tall pea plant (Tt) crossed with another gives a 3:1 tall:dwarf ratio in the F₂ generation.",
      "Natural selection: individuals with favourable variations survive and reproduce more, so those variations become common.",
      "Evidence for evolution comes from fossils, homologous organs (same structure, different function), analogous organs and embryology.",
      "Speciation happens when populations become reproductively isolated — by geography, genetic drift or natural selection.",
      "Acquired traits (like a bodybuilder's muscles) are not inherited; only changes in germ cells are.",
    ],
    keyPoints: [
      "Variation + inheritance + selection + time = evolution.",
      "F₂ phenotypic ratio of a monohybrid cross is 3:1.",
      "Fossils are the strongest direct evidence.",
      "Acquired characters are not inherited.",
    ],
    example:
      "Darwin's finches on the Galápagos islands evolved different beak shapes because each island's food source selected for a different beak.",
    practice: ["State Mendel's law of segregation.", "What is the phenotypic ratio of a monohybrid cross?"],
  },

  /* ------------------------------- ENGLISH ------------------------------ */
  {
    id: "parts-of-speech",
    subject: "english",
    title: "Parts of Speech",
    keywords: ["parts of speech", "noun", "pronoun", "verb", "adjective", "adverb", "preposition", "conjunction"],
    simple:
      "Every word in a sentence does a job. English has eight parts of speech: noun, pronoun, verb, adjective, adverb, preposition, conjunction and interjection.",
    deep: [
      "Noun: names a person, place, thing or idea (teacher, Pune, courage). Types include common, proper, collective, abstract and material nouns.",
      "Pronoun: replaces a noun to avoid repetition (he, she, which, themselves).",
      "Verb: shows an action or a state of being (run, is, seem). Transitive verbs take an object; intransitive verbs do not.",
      "Adjective: describes a noun (bright, three, Indian). Adverb: describes a verb, adjective or another adverb (quickly, very, yesterday).",
      "Preposition: shows the relationship between a noun and another word (in, on, under, between).",
      "Conjunction: joins words, phrases or clauses (and, but, because, although). Coordinating conjunctions are remembered as FANBOYS: for, and, nor, but, or, yet, so.",
      "Interjection: a sudden expression of feeling (Wow! Alas!).",
    ],
    keyPoints: [
      "Eight parts of speech.",
      "A word's part of speech depends on its use in the sentence.",
      "FANBOYS = coordinating conjunctions.",
      "Adjectives modify nouns; adverbs modify verbs/adjectives/adverbs.",
    ],
    example:
      "In 'The quick brown fox jumps swiftly over the lazy dog': quick and brown are adjectives, fox and dog are nouns, jumps is a verb, swiftly is an adverb, over is a preposition, the is an article (a type of adjective).",
    practice: ["Identify the parts of speech in: 'She sang beautifully at the concert.'", "What is the difference between an adjective and an adverb?"],
  },
  {
    id: "tenses",
    subject: "english",
    title: "English Tenses",
    keywords: ["tense", "present tense", "past tense", "future tense", "grammar", "verb forms"],
    simple:
      "Tense shows when an action happens. English has three times (past, present, future) and four aspects (simple, continuous, perfect, perfect continuous) — twelve tenses in all.",
    deep: [
      "Present simple: habitual facts — 'She writes every day.' Present continuous: happening now — 'She is writing.'",
      "Present perfect: action completed with present relevance — 'She has written three letters.' Present perfect continuous: 'She has been writing since morning.'",
      "Past simple: finished action at a specific time — 'She wrote yesterday.' Past continuous: 'She was writing when I called.'",
      "Past perfect: the earlier of two past actions — 'She had written before he arrived.'",
      "Future forms: will (spontaneous decision/prediction), going to (plan/evidence), present continuous for arrangements, and present simple for timetables.",
      "Signal words help: 'since' and 'for' with perfect tenses, 'while' with continuous, 'already/yet/just' with perfect.",
    ],
    keyPoints: [
      "3 times × 4 aspects = 12 tenses.",
      "Simple = fact/habit; continuous = in progress; perfect = completed.",
      "Use 'has/have + past participle' for perfect tenses.",
      "Signal words tell you which tense to use.",
    ],
    example:
      "'I have been studying since 7 p.m.' = present perfect continuous (started in the past, still going on).",
    practice: ["Fill in: She ____ (live) here since 2019.", "Change to past continuous: 'They play football.'"],
  },
  {
    id: "essay-writing",
    subject: "english",
    title: "Essay and Letter Writing",
    keywords: ["essay", "paragraph", "letter writing", "composition", "report writing", "story writing"],
    simple:
      "Good writing has a clear structure: an introduction that states the topic, body paragraphs with one idea each, and a conclusion that summarises.",
    deep: [
      "Plan before you write: brainstorm, group ideas, and order them logically.",
      "A paragraph has one central idea, a topic sentence, supporting sentences and a concluding or linking sentence.",
      "Use the PEEL structure: Point, Evidence, Explanation, Link.",
      "Formal letters (job, complaint, editor) use a fixed format: sender's address, date, receiver's designation, subject, salutation, body, subscription.",
      "Informal letters use a friendly tone and first person.",
      "In essays, connect ideas with discourse markers: however, therefore, moreover, in contrast, consequently.",
      "Always revise: check spelling, punctuation, subject–verb agreement and tense consistency.",
    ],
    keyPoints: [
      "Introduction → body → conclusion.",
      "One idea per paragraph.",
      "PEEL: Point, Evidence, Explanation, Link.",
      "Match the tone to the audience.",
    ],
    example:
      "For the topic 'Importance of Trees': introduction with a hook, one paragraph on oxygen, one on preventing soil erosion, one on wildlife, and a conclusion with a call to action.",
    practice: ["Write a formal letter to the editor about plastic waste.", "Outline a 200-word essay on 'My Aim in Life'."],
  },
  {
    id: "figurative-language",
    subject: "english",
    title: "Figurative Language",
    keywords: ["simile", "metaphor", "personification", "imagery", "alliteration", "hyperbole", "poetry devices"],
    simple:
      "Figurative language uses words imaginatively rather than literally to create pictures and feelings in the reader's mind.",
    deep: [
      "Simile: a comparison using 'like' or 'as' — 'as brave as a lion'.",
      "Metaphor: a direct comparison without 'like' or 'as' — 'The classroom was a zoo.'",
      "Personification: giving human qualities to non-human things — 'The wind whispered.'",
      "Hyperbole: deliberate exaggeration for effect — 'I have told you a thousand times.'",
      "Alliteration: repetition of the same initial consonant sound — 'Peter Piper picked a peck.'",
      "Onomatopoeia: words that imitate sounds — buzz, clang, murmur.",
      "Imagery: language that appeals to the five senses, creating a vivid mental picture.",
    ],
    keyPoints: [
      "Simile uses like/as; metaphor does not.",
      "Personification gives human traits.",
      "Hyperbole is exaggeration.",
      "Alliteration repeats initial sounds.",
    ],
    example:
      "'The stars danced playfully in the moonlit sky' — personification (stars dancing) plus imagery (moonlit sky).",
    practice: ["Identify the device: 'Her smile was a ray of sunshine.'", "Write a sentence using alliteration."],
  },
  {
    id: "active-passive-voice",
    subject: "english",
    title: "Active and Passive Voice",
    keywords: ["active voice", "passive voice", "voice change", "grammar", "reported speech"],
    simple:
      "In the active voice the subject does the action; in the passive voice the subject receives the action.",
    deep: [
      "Active: Subject + verb + object. Passive: Object + be + past participle + by + subject.",
      "Only sentences with a transitive verb (one that takes an object) can be changed to the passive.",
      "Tense is preserved: 'She writes a letter' → 'A letter is written by her.' 'She wrote' → 'A letter was written by her.'",
      "Use the passive when the action matters more than the doer, or when the doer is unknown: 'The window was broken.'",
      "Imperatives become passive with 'let': 'Open the door' → 'Let the door be opened.'",
      "Questions: 'Who broke it?' → 'By whom was it broken?'",
    ],
    keyPoints: [
      "Active = subject acts. Passive = subject receives.",
      "Passive = be (in the correct tense) + past participle.",
      "Tense does not change when converting.",
      "Intransitive verbs cannot be made passive.",
    ],
    example:
      "Active: 'The scientist discovered the vaccine.' Passive: 'The vaccine was discovered by the scientist.'",
    practice: ["Change to passive: 'They are building a new bridge.'", "Change to active: 'The poem was written by her.'"],
  },

  /* ------------------------------- HISTORY ------------------------------ */
  {
    id: "indian-independence",
    subject: "history",
    title: "India's Struggle for Independence",
    keywords: ["independence", "freedom struggle", "gandhi", "quit india", "partition", "1947", "congress"],
    simple:
      "India gained independence from British rule on 15 August 1947 after decades of organised resistance, from the Revolt of 1857 to Gandhi's mass movements.",
    deep: [
      "1857: The Revolt (First War of Independence) — sepoys rose at Meerut; though suppressed, it ended East India Company rule and brought the British Crown to power in 1858.",
      "1885: Indian National Congress founded by Womesh Chandra Bonerjee, with A.O. Hume's support.",
      "1905–1911: Swadeshi movement against the partition of Bengal, led by Bal Gangadhar Tilak, Bipin Chandra Pal and Lala Lajpat Rai (Lal-Bal-Pal).",
      "1919: Jallianwala Bagh massacre at Amritsar by General Dyer — a turning point that massified the movement.",
      "1920–22: Non-Cooperation Movement; 1930: Dandi Salt March and Civil Disobedience; 1942: Quit India Movement ('Do or Die').",
      "1947: The Indian Independence Act partitioned British India into India and Pakistan; Jawaharlal Nehru became the first Prime Minister.",
      "Revolutionaries like Bhagat Singh, Chandrashekhar Azad and Subhas Chandra Bose (INA) represented the militant strand of the movement.",
    ],
    keyPoints: [
      "1857 Revolt ended Company rule.",
      "INC founded 1885.",
      "Three major Gandhian movements: Non-Cooperation, Civil Disobedience, Quit India.",
      "Independence: 15 August 1947; partition accompanied it.",
    ],
    example:
      "The Dandi March of 1930 walked 240 miles to the sea to make salt, breaking the British salt monopoly and turning a small act into a mass symbol of defiance.",
    practice: ["Why is 1857 called the First War of Independence?", "What was the significance of the Quit India Movement?"],
  },
  {
    id: "mughal-empire",
    subject: "history",
    title: "The Mughal Empire",
    keywords: ["mughal", "akbar", "shah jahan", "aurangzeb", "babur", "taj mahal", "mansabdari"],
    simple:
      "The Mughal Empire ruled most of India from 1526 to 1857, founded by Babur after the First Battle of Panipat.",
    deep: [
      "Babur (1526–1530) defeated Ibrahim Lodi at Panipat and Rana Sanga at Khanwa, establishing Mughal rule.",
      "Akbar (1556–1605) was the greatest ruler: he expanded the empire, introduced the mansabdari and zabt systems, abolished the jizya, and followed sulh-i-kul (peace with all) through debates at the Ibadat Khana.",
      "Jahangir and Shah Jahan consolidated the empire; Shah Jahan built the Taj Mahal, the Red Fort and the Jama Masjid.",
      "Aurangzeb (1658–1707) expanded the empire to its greatest extent but his religious policies, Deccan wars and revolts by Marathas, Sikhs, Jats and Rajputs weakened it.",
      "After Aurangzeb, the empire fragmented; Nadir Shah's invasion (1739) and Ahmad Shah Abdali's raids accelerated the decline.",
      "Bahadur Shah Zafar II was the last Mughal, exiled after the 1857 revolt.",
    ],
    keyPoints: [
      "1526: Babur founds the empire at Panipat.",
      "Akbar's policies: mansabdari, zabt, sulh-i-kul, no jizya.",
      "Taj Mahal built by Shah Jahan for Mumtaz Mahal.",
      "Aurangzeb's long Deccan wars hastened decline.",
    ],
    example:
      "Akbar's court had the Navaratnas — nine geniuses including Tansen, Birbal and Abul Fazl — showing how he blended talent from every community.",
    practice: ["Explain Akbar's religious policy.", "Why did the Mughal empire decline after Aurangzeb?"],
  },
  {
    id: "world-war-ii",
    subject: "history",
    title: "The World Wars",
    keywords: ["world war", "ww1", "ww2", "hitler", "versailles", "nazi", "united nations", "hiroshima"],
    simple:
      "The two world wars (1914–18 and 1939–45) reshaped the globe, ended empires, and led to the creation of the United Nations.",
    deep: [
      "First World War (1914–1918): triggered by the assassination of Archduke Franz Ferdinand; fought between the Allies (Britain, France, Russia, later USA) and the Central Powers (Germany, Austria-Hungary, Ottoman Empire).",
      "The Treaty of Versailles (1919) imposed harsh reparations and territorial losses on Germany, creating resentment that fuelled the rise of Nazism.",
      "Second World War (1939–1945): Germany invaded Poland; Axis powers were Germany, Italy and Japan; the Allies included Britain, USSR, USA and China.",
      "Key turning points: Battle of Britain (1940), Operation Barbarossa (1941), Pearl Harbor (1941), Stalingrad (1942–43), D-Day (1944).",
      "The Holocaust: the Nazi genocide of six million Jews and millions of others.",
      "It ended with Germany's surrender in May 1945 and the atomic bombings of Hiroshima and Nagasaki in August 1945, followed by Japan's surrender.",
      "The United Nations was founded in 1945 to prevent future global conflict.",
    ],
    keyPoints: [
      "WWI: 1914–18; WWII: 1939–45.",
      "Treaty of Versailles 1919 humiliated Germany.",
      "Holocaust = Nazi genocide of six million Jews.",
      "UN founded 1945 after WWII.",
    ],
    example:
      "The League of Nations failed to stop aggression in the 1930s, which is exactly why the United Nations was designed with stronger collective security machinery in 1945.",
    practice: ["What were the main causes of the First World War?", "Why was the Treaty of Versailles a cause of the Second World War?"],
  },
  {
    id: "indus-valley-civilisation",
    subject: "history",
    title: "The Indus Valley Civilisation",
    keywords: ["indus valley", "harappan", "mohenjo-daro", "dholavira", "bronze age", "harappan script"],
    simple:
      "The Indus Valley Civilisation (c. 2600–1900 BCE) was one of the world's earliest urban cultures, famous for planned cities and advanced drainage.",
    deep: [
      "Major sites: Harappa and Mohenjo-daro (Pakistan), Dholavira, Lothal, Kalibangan and Rakhigarhi (India).",
      "Cities were built on a grid plan with a fortified citadel and a lower town — showing remarkable town planning.",
      "The Great Bath at Mohenjo-daro was a watertight brick tank, probably used for ritual bathing.",
      "Drainage: almost every house had a bathroom connected to covered street drains — the finest sanitation system of the ancient world.",
      "Economy: agriculture (wheat, barley, cotton), trade with Mesopotamia (seals found there), standardised weights and measures.",
      "Crafts: bronze (the Dancing Girl statue), terracotta, bead-making and seals with the still-undeciphered Harappan script.",
      "Decline is attributed to a combination of climate change, river drying, flooding and possibly invasion.",
    ],
    keyPoints: [
      "Also called the Harappan Civilisation.",
      "Grid-pattern towns, citadel and lower town.",
      "Great Bath and advanced drainage system.",
      "Trade with Mesopotamia; undeciphered script.",
    ],
    example:
      "The uniformity of Harappan bricks (ratio 1:2:4) across cities hundreds of kilometres apart suggests central standardisation or shared cultural norms.",
    practice: ["Describe the town planning of Mohenjo-daro.", "What evidence do we have of Harappan trade?"],
  },
  {
    id: "french-revolution",
    subject: "history",
    title: "The French Revolution",
    keywords: ["french revolution", "bastille", "robespierre", "napoleon", "estates general", "liberty equality fraternity"],
    simple:
      "The French Revolution (1789–1799) overthrew the monarchy and feudal privileges in France, spreading ideas of liberty, equality and fraternity.",
    deep: [
      "French society was divided into three estates: clergy (First), nobility (Second) and everyone else — peasants, workers, bourgeoisie (Third). Only the Third Estate paid taxes.",
      "Causes: an empty treasury after wars including support for America, a rising population, a privileged elite, and Enlightenment ideas from Rousseau, Voltaire and Montesquieu.",
      "14 July 1789: the Bastille prison was stormed — the revolution's symbolic start.",
      "The National Assembly issued the Declaration of the Rights of Man and of the Citizen; feudalism and tithes were abolished.",
      "1793: Louis XVI and Marie Antoinette were executed; the Reign of Terror under Robespierre followed.",
      "1799: Napoleon Bonaparte seized power, ending the revolution but exporting its legal reforms (the Napoleonic Code) across Europe.",
      "The revolution inspired nationalist and democratic movements worldwide, including in India.",
    ],
    keyPoints: [
      "1789: storming of the Bastille.",
      "Three estates; only the Third Estate paid tax.",
      "Ideals: liberty, equality, fraternity.",
      "Napoleon rose in 1799 and spread the Napoleonic Code.",
    ],
    example:
      "'Liberty, Equality, Fraternity' — the revolution's motto — became France's national motto and is still used today.",
    practice: ["Explain the role of the three estates in causing the revolution.", "What was the significance of 14 July 1789?"],
  },

  /* ------------------------------ GEOGRAPHY ----------------------------- */
  {
    id: "solar-system",
    subject: "geography",
    title: "The Solar System",
    keywords: ["solar system", "planets", "sun", "earth", "mars", "jupiter", "asteroid", "milky way"],
    simple:
      "The solar system is the Sun and everything held by its gravity: eight planets, their moons, dwarf planets, asteroids and comets.",
    deep: [
      "The Sun holds 99.86% of the solar system's mass; it is a G-type main-sequence star fusing hydrogen into helium.",
      "Order from the Sun: Mercury, Venus, Earth, Mars (terrestrial/rocky), then Jupiter, Saturn, Uranus, Neptune (gas/ice giants).",
      "An easy memory trick: 'My Very Educated Mother Just Served Us Noodles.'",
      "The asteroid belt lies between Mars and Jupiter; Pluto was reclassified as a dwarf planet in 2006.",
      "A planet's year length grows with distance from the Sun (Kepler's third law): Mercury 88 days, Neptune 165 years.",
      "Earth is unique for liquid surface water, a protective atmosphere and a magnetic field.",
      "The solar system orbits the centre of the Milky Way galaxy roughly every 230 million years.",
    ],
    keyPoints: [
      "8 planets, 4 rocky inner + 4 giant outer.",
      "Asteroid belt between Mars and Jupiter.",
      "Venus is the hottest planet; Jupiter the largest.",
      "Pluto is a dwarf planet since 2006.",
    ],
    example:
      "Venus is hotter than Mercury even though it is farther from the Sun, because its thick CO₂ atmosphere traps heat in a runaway greenhouse effect.",
    practice: ["List the planets in order from the Sun.", "Why is Venus hotter than Mercury?"],
  },
  {
    id: "monsoon",
    subject: "geography",
    title: "The Monsoon",
    keywords: ["monsoon", "rainfall", "south west monsoon", "retreating monsoon", "climate india", "seasons"],
    simple:
      "The monsoon is a seasonal wind that reverses direction, bringing most of India's rainfall between June and September.",
    deep: [
      "In summer, the land heats faster than the ocean, creating low pressure over India that pulls in moist air from the Indian Ocean.",
      "The southwest monsoon arrives around 1 June in Kerala and reaches most of India by mid-July; the Western Ghats and the Himalayas force the air to rise, causing heavy rain.",
      "The monsoon 'bursts' then retreats from northwest India in October, and the retreating monsoon picks up moisture from the Bay of Bengal, giving Tamil Nadu its winter rain.",
      "Mawsynram and Cherrapunji in Meghalaya are among the wettest places on Earth.",
      "Indian agriculture depends heavily on monsoon rainfall; failure causes drought and crop loss.",
      "The monsoon is part of the global atmospheric circulation and is influenced by El Niño and La Niña in the Pacific.",
    ],
    keyPoints: [
      "Seasonal reversal of wind direction.",
      "Southwest monsoon: June–September.",
      "Orographic rain on the Western Ghats.",
      "Retreating monsoon gives Tamil Nadu winter rainfall.",
    ],
    example:
      "The Western Ghats receive over 250 cm of rain on the windward side while the leeward Deccan plateau lies in a rain shadow and receives far less.",
    practice: ["Why does Tamil Nadu receive rain in winter?", "Explain how the monsoon affects Indian agriculture."],
  },
  {
    id: "types-of-rocks",
    subject: "geography",
    title: "Rocks and Minerals",
    keywords: ["rocks", "igneous", "sedimentary", "metamorphic", "rock cycle", "minerals", "weathering"],
    simple:
      "Rocks are classified by how they formed: igneous (from cooled magma), sedimentary (from deposited layers) and metamorphic (changed by heat and pressure).",
    deep: [
      "Igneous rocks form when magma or lava cools. Intrusive (plutonic) rocks like granite cool slowly underground with large crystals; extrusive (volcanic) rocks like basalt cool quickly with fine grains.",
      "Sedimentary rocks form from weathered material transported and deposited in layers, then cemented. Fossils are found almost only in these rocks. Examples: sandstone, limestone, shale, coal.",
      "Metamorphic rocks form when existing rocks are changed by intense heat and pressure without melting. Marble comes from limestone; slate from shale; quartzite from sandstone.",
      "The rock cycle shows how rocks continuously transform from one type to another over millions of years.",
      "Minerals are naturally occurring inorganic solids with a definite chemical composition and crystal structure. Ore is a rock from which a metal can be extracted economically.",
      "Weathering (breaking down rocks in place), erosion (transport) and deposition (laying down) shape landforms.",
    ],
    keyPoints: [
      "3 rock types: igneous, sedimentary, metamorphic.",
      "Fossils are found in sedimentary rocks.",
      "Marble ← limestone; slate ← shale.",
      "The rock cycle is continuous.",
    ],
    example:
      "Limestone (sedimentary) buried deep under a mountain range becomes marble (metamorphic); if it melts and cools at the surface it becomes basalt (igneous).",
    practice: ["How are igneous rocks formed?", "Which rock type contains fossils and why?"],
  },
  {
    id: "climate-change",
    subject: "geography",
    title: "Climate Change and Global Warming",
    keywords: ["climate change", "global warming", "greenhouse effect", "carbon footprint", "renewable energy"],
    simple:
      "Global warming is the rise in Earth's average temperature caused by greenhouse gases released mainly by burning fossil fuels.",
    deep: [
      "The natural greenhouse effect keeps Earth about 33°C warmer than it would otherwise be — without it, life could not exist.",
      "Human activity has increased CO₂ from about 280 ppm before industrialisation to over 420 ppm today, mainly from burning coal, oil and gas.",
      "Other greenhouse gases: methane (livestock, rice paddies, landfills), nitrous oxide and fluorinated gases.",
      "Consequences: rising sea levels from thermal expansion and ice melt, more frequent extreme weather, shifting agricultural zones, coral bleaching and biodiversity loss.",
      "Mitigation: renewable energy, energy efficiency, public transport, afforestation and reduced waste.",
      "Adaptation: drought-resistant crops, flood defences and better disaster preparedness.",
      "International response: the Paris Agreement (2015) aims to limit warming to well below 2°C, preferably 1.5°C, above pre-industrial levels.",
    ],
    keyPoints: [
      "Greenhouse gases trap outgoing heat.",
      "CO₂ is the main anthropogenic greenhouse gas.",
      "Consequences: sea-level rise, extreme weather, biodiversity loss.",
      "Paris Agreement target: well below 2°C.",
    ],
    example:
      "Switching from a petrol scooter to walking, cycling or an electric vehicle cuts your personal carbon footprint because no CO₂ is released at the point of use.",
    practice: ["Explain the greenhouse effect.", "Name three ways students can reduce their carbon footprint."],
  },
  {
    id: "maps-and-scale",
    subject: "geography",
    title: "Maps, Scale and Coordinates",
    keywords: ["map", "scale", "latitude", "longitude", "contour", "grid reference", "compass"],
    simple:
      "A map is a flat drawing of the Earth's surface. Scale tells you how much smaller it is, and latitude/longitude tell you exactly where you are.",
    deep: [
      "Scale = map distance ÷ ground distance. A 1:50,000 scale means 1 cm on the map is 50,000 cm (500 m) on the ground.",
      "Types of scale: statement (verbal), representative fraction (RF) and linear (graphic) scale.",
      "Latitude lines run east–west, measured 0° at the equator to 90° at the poles. Longitude lines run north–south, 0° at Greenwich to 180°.",
      "Important parallels: Tropic of Cancer (23.5°N), Tropic of Capricorn (23.5°S), Arctic and Antarctic Circles (66.5°).",
      "Contour lines join points of equal height; closely spaced contours mean a steep slope.",
      "Conventional signs and colours are standardised so any map can be read anywhere: blue for water, green for lowland, brown for highland.",
      "A compass shows direction; the magnetic needle points roughly to magnetic north, and you must correct for magnetic declination.",
    ],
    keyPoints: [
      "Scale converts map distance to ground distance.",
      "Latitude = angular distance from the equator.",
      "Longitude measured from Greenwich (0°).",
      "Close contours = steep slope.",
    ],
    example:
      "On a 1:25,000 map, 4 cm between two villages is 4 × 250 m = 1000 m = 1 km on the ground.",
    practice: ["Convert: 3 cm on a 1:50,000 map = how many km?", "What is the latitude of the Tropic of Cancer?"],
  },

  /* -------------------------- COMPUTER SCIENCE -------------------------- */
  {
    id: "algorithms",
    subject: "computer-science",
    title: "Algorithms and Flowcharts",
    keywords: ["algorithm", "flowchart", "pseudocode", "complexity", "big o", "sorting", "searching"],
    simple:
      "An algorithm is a finite set of clear steps to solve a problem. It must be unambiguous, terminate, and produce the correct output.",
    deep: [
      "Properties of a good algorithm: finiteness, definiteness, clear input/output, effectiveness.",
      "Representation: pseudocode (structured plain language) and flowcharts (diagram with standard symbols — oval for start/end, rectangle for process, diamond for decision, parallelogram for input/output).",
      "Linear search checks every element (O(n)); binary search needs a sorted array and halves the search space each step (O(log n)).",
      "Bubble, selection and insertion sort are O(n²); merge sort and quicksort are O(n log n).",
      "Big-O notation describes how running time grows with input size, ignoring constants.",
      "Correctness is proved by reasoning about invariants; efficiency is measured by time and space complexity.",
    ],
    keyPoints: [
      "An algorithm must be finite, definite and effective.",
      "Binary search requires sorted data.",
      "O(1) < O(log n) < O(n) < O(n log n) < O(n²).",
      "Flowcharts use standard symbols.",
    ],
    example:
      "Finding a word in a 1000-page dictionary: linear search would start at page 1, but binary search opens the middle, compares, and discards half — about 10 steps instead of 1000.",
    code: {
      lang: "python",
      code: "def binary_search(arr, target):\n    lo, hi = 0, len(arr) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1",
    },
    practice: ["Write pseudocode to find the largest number in a list.", "What is the time complexity of binary search?"],
  },
  {
    id: "binary-numbers",
    subject: "computer-science",
    title: "Number Systems and Binary",
    keywords: ["binary", "number system", "decimal to binary", "bits", "bytes", "ascii", "hexadecimal"],
    simple:
      "Computers use the binary (base-2) number system, which has only two digits: 0 and 1, matching the on/off states of a transistor.",
    deep: [
      "Binary place values are powers of 2: 1, 2, 4, 8, 16, 32, 64, 128, 256.",
      "Decimal 13 = 1101 in binary because 13 = 8 + 4 + 0 + 1.",
      "To convert decimal to binary, repeatedly divide by 2 and read the remainders upwards.",
      "A bit is one binary digit; a byte is 8 bits and can store 256 different values (0–255).",
      "Hexadecimal (base 16) uses 0–9 and A–F; each hex digit equals exactly 4 bits, so it is a compact way to write binary.",
      "Text is stored as numbers using character encodings: ASCII (128 characters) and Unicode/UTF-8 (over a million characters, covering all world scripts).",
      "Images are stored as a grid of pixels, each with binary colour values; audio is sampled and quantised.",
    ],
    keyPoints: [
      "Binary is base 2; decimal is base 10.",
      "8 bits = 1 byte = 256 values.",
      "1 hex digit = 4 bits.",
      "ASCII and Unicode encode characters as numbers.",
    ],
    example:
      "The binary 1011 equals 1×8 + 0×4 + 1×2 + 1×1 = 11 in decimal.",
    code: {
      lang: "python",
      code: "n = 13\nprint(bin(n))     # 0b1101\nprint(format(n, '08b'))  # 00001101",
    },
    practice: ["Convert 25 to binary.", "How many values can 4 bits store?"],
  },
  {
    id: "how-the-internet-works",
    subject: "computer-science",
    title: "How the Internet Works",
    keywords: ["internet", "ip address", "dns", "http", "packets", "router", "server", "client"],
    simple:
      "The internet is a global network of networks. Data travels as small packets that are routed between devices using IP addresses, with DNS translating names into those addresses.",
    deep: [
      "Each device on a network has an IP address (IPv4 like 192.168.1.1 or IPv6). DNS (Domain Name System) converts human-readable names like helixedu.app into IP addresses.",
      "Data is broken into packets, each with a header containing source and destination addresses. Packets may take different routes and are reassembled at the destination (TCP guarantees order; UDP is faster but unordered).",
      "Routers forward packets between networks; switches connect devices within a network.",
      "HTTP/HTTPS is the protocol of the web. HTTPS adds TLS encryption so third parties cannot read the traffic.",
      "A web request flow: browser → DNS lookup → TCP connection → HTTP request → server response → render.",
      "Cloud computing, CDNs and caching make the same content fast everywhere in the world.",
    ],
    keyPoints: [
      "Internet = network of networks.",
      "DNS resolves names to IP addresses.",
      "Data travels in packets; TCP reassembles them reliably.",
      "HTTPS = HTTP + TLS encryption.",
    ],
    example:
      "Typing a URL: your browser asks a DNS server for the IP address, opens a connection to that server, sends an HTTP GET request, and the server returns HTML which the browser renders.",
    practice: ["What is the role of DNS?", "Why is HTTPS important?"],
  },
  {
    id: "programming-basics",
    subject: "computer-science",
    title: "Programming Fundamentals",
    keywords: ["programming", "variables", "loops", "functions", "conditionals", "data types", "debugging"],
    simple:
      "Programming means giving a computer precise instructions. Core building blocks are variables, data types, conditionals, loops and functions.",
    deep: [
      "Variables are named containers for values. Data types include integers, floats, strings, booleans, lists/arrays and dictionaries/objects.",
      "Conditionals (if / else if / else, switch) let a program make decisions.",
      "Loops repeat work: for loops over a known range or collection, while loops until a condition fails.",
      "Functions package reusable logic with inputs (parameters) and an output (return value), following the DRY principle — Don't Repeat Yourself.",
      "Debugging: read the error message, reproduce the bug, isolate it (print statements or a debugger), fix it, then test again.",
      "Good practice: clear names, small functions, comments explaining why, and tests for important behaviour.",
    ],
    keyPoints: [
      "Variables store data; data types constrain what fits.",
      "if/else for decisions; for/while for repetition.",
      "Functions enable reuse (DRY).",
      "Read error messages carefully — they tell you the line and reason.",
    ],
    example:
      "A program that prints the multiplication table of 7 uses a for loop from 1 to 10 and prints 7 × i each time.",
    code: {
      lang: "python",
      code: "for i in range(1, 11):\n    print(f\"7 x {i} = {7 * i}\")\n\n\ndef average(numbers):\n    return sum(numbers) / len(numbers)\n\nprint(average([10, 20, 30]))  # 20.0",
    },
    practice: ["Write a function to check whether a number is even.", "Write a loop that prints numbers 1 to 20 that are divisible by 3."],
  },
  {
    id: "html-css-basics",
    subject: "computer-science",
    title: "HTML and CSS Basics",
    keywords: ["html", "css", "web page", "tags", "styling", "responsive", "css box model"],
    simple:
      "HTML structures a web page with tags; CSS styles it with rules that select elements and set properties.",
    deep: [
      "HTML (HyperText Markup Language) uses elements like <h1>–<h6> for headings, <p> for paragraphs, <a> for links, <img> for images, <ul>/<ol> for lists and <div>/<span> as generic containers.",
      "Semantic HTML (<header>, <nav>, <main>, <article>, <footer>) improves accessibility and SEO.",
      "CSS rules are selector { property: value }. Types of selectors: element, class (.name), id (#name) and attribute.",
      "The box model: every element is a box with content, padding, border and margin. box-sizing: border-box makes width include padding and border.",
      "Layout: flexbox for one-dimensional layouts, grid for two-dimensional. Media queries make a design responsive to screen size.",
      "The cascade decides which rule wins: specificity (inline > id > class > element), then source order. Use classes rather than ids for styling.",
      "Colours can be named, hex (#ff0000), rgb() or hsl(). Relative units (rem, %, vh/vw) make layouts adapt to the user's settings.",
    ],
    keyPoints: [
      "HTML = structure, CSS = presentation, JS = behaviour.",
      "Use semantic tags for accessibility.",
      "Box model: content → padding → border → margin.",
      "Flexbox = 1D layout, Grid = 2D layout.",
    ],
    example:
      "A responsive card: display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; — automatically fits as many columns as the screen allows.",
    code: {
      lang: "html",
      code: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>HELIXEDU</title>\n  <style>\n    body { font-family: system-ui, sans-serif; background: #05030f; color: #e9e4ff; }\n    .card { border-radius: 16px; padding: 20px; box-shadow: 0 10px 30px #0006; }\n  </style>\n</head>\n<body>\n  <main class=\"card\">\n    <h1>Hello, HELIXEDU</h1>\n    <p>My first styled page.</p>\n  </main>\n</body>\n</html>",
    },
    practice: ["Write HTML for an unordered list of three subjects.", "Which CSS property makes a layout responsive?"],
  },
  {
    id: "databases-sql",
    subject: "computer-science",
    title: "Databases and SQL",
    keywords: ["database", "sql", "table", "primary key", "foreign key", "query", "normalisation", "join"],
    simple:
      "A database stores data in tables. SQL (Structured Query Language) is used to create, read, update and delete that data.",
    deep: [
      "A table has rows (records) and columns (fields). Each column has a data type such as INTEGER, TEXT, DATE or BOOLEAN.",
      "A primary key uniquely identifies each row. A foreign key references a primary key in another table, enforcing relationships.",
      "Core commands: SELECT (read), INSERT (add), UPDATE (modify), DELETE (remove). Together these are CRUD operations.",
      "WHERE filters rows; ORDER BY sorts; GROUP BY aggregates; JOIN combines rows from related tables.",
      "Types of JOIN: INNER (matching rows only), LEFT (all from the left table), RIGHT, and FULL.",
      "Normalisation organises tables to reduce duplication: 1NF (atomic values), 2NF (no partial dependency), 3NF (no transitive dependency).",
      "An index speeds up searches on a column, at the cost of slower writes and more storage.",
      "Transactions group operations so they all succeed or all fail (ACID: Atomicity, Consistency, Isolation, Durability).",
    ],
    keyPoints: [
      "Tables = rows + typed columns.",
      "Primary key = unique identifier; foreign key = link to another table.",
      "CRUD = Create, Read, Update, Delete.",
      "JOINs combine related tables; GROUP BY aggregates.",
    ],
    example:
      "SELECT name, score FROM students WHERE score > 80 ORDER BY score DESC; — returns the names and scores of top students, highest first.",
    code: {
      lang: "sql",
      code: "CREATE TABLE students (\n  id SERIAL PRIMARY KEY,\n  name TEXT NOT NULL,\n  class TEXT,\n  score INTEGER\n);\n\nINSERT INTO students (name, class, score)\nVALUES ('Aarav', '10-A', 92);\n\nSELECT class, AVG(score) AS avg_score\nFROM students\nGROUP BY class\nHAVING AVG(score) > 70;",
    },
    practice: ["Write a query to find all students in class 10-A.", "What is the difference between a primary key and a foreign key?"],
  },
  {
    id: "computer-networks",
    subject: "computer-science",
    title: "Computer Networks and Security",
    keywords: ["network", "lan", "wan", "firewall", "encryption", "phishing", "cyber security", "malware"],
    simple:
      "A computer network connects devices to share data and resources. Network security protects that data from unauthorised access.",
    deep: [
      "Types by size: PAN (personal), LAN (a building/school), MAN (a city), WAN (across countries — the internet is the largest WAN).",
      "Topologies: star, bus, ring, mesh and hybrid. The star topology is most common because one device failing does not bring down the network.",
      "Transmission media: twisted pair cable, coaxial cable, optical fibre (fastest, uses light) and wireless (Wi-Fi, Bluetooth, satellite).",
      "Network devices: modem, router, switch, hub, repeater, access point and firewall.",
      "Threats: malware (virus, worm, trojan, ransomware), phishing, spoofing, denial-of-service attacks and data breaches.",
      "Defences: strong unique passwords, two-factor authentication, encryption (TLS/HTTPS), firewalls, updates and not clicking unknown links.",
      "Ethics and law: respecting privacy, not sharing others' data, and following cyber laws.",
    ],
    keyPoints: [
      "LAN < MAN < WAN.",
      "Fibre optic is the fastest wired medium.",
      "Firewalls filter traffic; encryption protects content.",
      "2FA and strong passwords are the first line of defence.",
    ],
    example:
      "Public Wi-Fi in a café is convenient but risky; using HTTPS and a VPN protects your data from anyone snooping on the same network.",
    practice: ["Differentiate between LAN and WAN.", "What is phishing and how can you avoid it?"],
  },

  /* ------------------------------ LANGUAGES ----------------------------- */
  {
    id: "spanish-basics",
    subject: "languages",
    title: "Spanish for Beginners",
    keywords: ["spanish", "espanol", "learn spanish", "spanish greetings", "spanish grammar"],
    simple:
      "Spanish is a Romance language spoken by over 500 million people. Nouns are masculine (usually -o) or feminine (usually -a), and adjectives must agree in gender and number.",
    deep: [
      "Greetings: hola (hello), buenos días (good morning), buenas tardes (good afternoon), buenas noches (good night), adiós (goodbye).",
      "Ser vs estar: both mean 'to be'. Ser is for permanent qualities (soy alto — I am tall), estar is for temporary states and locations (estoy cansado — I am tired; estoy en casa — I am at home).",
      "Present tense of regular -ar verbs: hablar (to speak) → hablo, hablas, habla, hablamos, habláis, hablan. Regular -er: comer → como, comes, come, comemos, coméis, comen. Regular -ir: vivir → vivo, vives, vive, vivimos, vivís, viven.",
      "Nouns ending in -o are usually masculine (el libro), those in -a usually feminine (la casa). Plurals add -s (or -es after a consonant).",
      "Numbers 1–10: uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez.",
      "Questions: ¿Cómo te llamas? (What is your name?) — Me llamo… (My name is…). Note the inverted question mark ¿.",
      "Spanish uses inverted punctuation ¿ ¡ for questions and exclamations.",
    ],
    keyPoints: [
      "Nouns are masculine or feminine.",
      "Ser = permanent, estar = temporary/location.",
      "Three regular verb endings: -ar, -er, -ir.",
      "Adjectives agree with the noun's gender and number.",
    ],
    example:
      "Hola, me llamo Aarav. Soy de la India. Estudio español todos los días. = Hello, my name is Aarav. I am from India. I study Spanish every day.",
    practice: ["Translate: 'Good morning, how are you?'", "Conjugate 'comer' in the present tense."],
  },
  {
    id: "french-basics",
    subject: "languages",
    title: "French for Beginners",
    keywords: ["french", "francais", "learn french", "french greetings", "french grammar"],
    simple:
      "French is a Romance language spoken across five continents. Every noun is masculine (le) or feminine (la), and most consonants at the end of a word are silent.",
    deep: [
      "Greetings: bonjour (hello/good day), bonsoir (good evening), salut (hi/bye, informal), au revoir (goodbye), merci (thank you), s'il vous plaît (please).",
      "Articles: le (the, masculine), la (the, feminine), les (the, plural), un (a, masculine), une (a, feminine).",
      "Introducing yourself: Je m'appelle… (My name is…), Comment t'appelles-tu ? (What's your name?), Je suis de… (I am from…).",
      "Regular -er verbs (like parler, to speak): je parle, tu parles, il/elle parle, nous parlons, vous parlez, ils/elles parlent.",
      "Numbers 1–10: un, deux, trois, quatre, cinq, six, sept, huit, neuf, dix.",
      "Silent letters: 'parle' is pronounced 'parl' — the final -e is usually silent, and final consonants often are too.",
      "Nasal vowels (an, on, in, un) and the French 'r' and 'u' sounds take practice; listening and repeating aloud is the fastest route.",
    ],
    keyPoints: [
      "le/la/les = the; un/une = a.",
      "Je m'appelle… for your name.",
      "-er verbs follow one regular pattern.",
      "Many final letters are silent.",
    ],
    example:
      "Bonjour ! Je m'appelle Priya. J'habite à Mumbai. J'aime la musique. = Hello! My name is Priya. I live in Mumbai. I like music.",
    practice: ["Say 'My name is…' and 'Thank you' in French.", "Conjugate 'parler' for je, tu, il."],
  },

  /* -------------------------- GENERAL KNOWLEDGE ------------------------- */
  {
    id: "indian-capitals",
    subject: "general-knowledge",
    title: "Indian States and Capitals",
    keywords: ["capitals", "states of india", "union territories", "india map", "capital of maharashtra"],
    simple:
      "India has 28 states and 8 union territories, each with its own capital. Maharashtra's capital is Mumbai.",
    deep: [
      "Northern states: Jammu & Kashmir (Srinagar/Jammu), Himachal Pradesh (Shimla), Punjab (Chandigarh), Haryana (Chandigarh), Uttarakhand (Dehradun), Uttar Pradesh (Lucknow).",
      "Western: Rajasthan (Jaipur), Gujarat (Gandhinagar), Maharashtra (Mumbai), Goa (Panaji).",
      "Southern: Karnataka (Bengaluru), Kerala (Thiruvananthapuram), Tamil Nadu (Chennai), Andhra Pradesh (Amaravati), Telangana (Hyderabad).",
      "Eastern: Bihar (Patna), Jharkhand (Ranchi), Odisha (Bhubaneswar), West Bengal (Kolkata), Sikkim (Gangtok), Assam (Dispur), and the seven sisters.",
      "Central: Madhya Pradesh (Bhopal), Chhattisgarh (Raipur).",
      "Union territories include Delhi (New Delhi), Puducherry, Chandigarh, Ladakh (Leh), J&K and Andaman & Nicobar (Port Blair).",
      "Chandigarh serves as the capital of both Punjab and Haryana, and Hyderabad of both Telangana and Andhra Pradesh (temporarily).",
    ],
    keyPoints: [
      "28 states and 8 union territories.",
      "Maharashtra → Mumbai; Karnataka → Bengaluru; Tamil Nadu → Chennai.",
      "Chandigarh is shared by Punjab and Haryana.",
      "New Delhi is the national capital.",
    ],
    example:
      "Mumbai, Maharashtra's capital, is also India's financial capital and the home of Bollywood.",
    practice: ["What is the capital of Odisha?", "Name two union territories and their capitals."],
  },
  {
    id: "inventions",
    subject: "general-knowledge",
    title: "Great Inventors and Inventions",
    keywords: ["inventions", "inventor", "discovery", "who invented", "edison", "newton", "science history"],
    simple:
      "Knowing who invented what, and when, builds a mental timeline of science and technology.",
    deep: [
      "Thomas Edison — practical incandescent light bulb (1879) and the phonograph.",
      "Alexander Graham Bell — telephone (1876). Guglielmo Marconi — radio transmission.",
      "Wright brothers (Orville and Wilbur) — the first powered aeroplane flight (1903).",
      "James Watt — improved the steam engine, powering the Industrial Revolution.",
      "Marie Curie — discovered radium and polonium; first person to win Nobel Prizes in two sciences.",
      "Alexander Fleming — penicillin (1928), the first widely used antibiotic.",
      "Isaac Newton — laws of motion and universal gravitation; co-invented calculus.",
      "Indian contributions: C. V. Raman (Raman effect), Homi Bhabha (nuclear programme), Vikram Sarabhai (ISRO), A. P. J. Abdul Kalam (missile and space work).",
      "Tim Berners-Lee invented the World Wide Web in 1989; Alan Turing laid the foundations of computer science.",
    ],
    keyPoints: [
      "Edison — bulb; Bell — telephone; Wright brothers — aeroplane.",
      "Curie — radium; Fleming — penicillin.",
      "Newton — gravitation; Turing — computer science.",
      "C. V. Raman won the 1930 Nobel Prize in Physics.",
    ],
    example:
      "Fleming noticed that a mould (Penicillium) killed bacteria in a contaminated petri dish — a chance observation that led to antibiotics that have saved millions of lives.",
    practice: ["Who invented the telephone?", "Name two Indian scientists and their contributions."],
  },
  {
    id: "united-nations",
    subject: "general-knowledge",
    title: "The United Nations and World Bodies",
    keywords: ["united nations", "un", "who", "unesco", "security council", "international organisation"],
    simple:
      "The United Nations, founded in 1945, is an international organisation working for peace, security and cooperation among nations.",
    deep: [
      "Founded 24 October 1945 after the Second World War, replacing the League of Nations. Headquarters: New York.",
      "Six principal organs: General Assembly, Security Council, Secretariat, International Court of Justice, Economic and Social Council, and the Trusteeship Council.",
      "The Security Council has 15 members, 5 permanent (China, France, Russia, UK, USA) with veto power and 10 elected for two-year terms.",
      "Specialised agencies: WHO (health), UNESCO (education, science, culture), UNICEF (children), ILO (labour), FAO (food and agriculture), World Bank and IMF (finance).",
      "Sustainable Development Goals (SDGs): 17 global goals adopted in 2015 for 2030, covering poverty, hunger, education, climate and equality.",
      "India is a founding member and a major contributor to UN peacekeeping missions.",
    ],
    keyPoints: [
      "UN founded 24 October 1945; HQ in New York.",
      "5 permanent Security Council members with veto power.",
      "17 Sustainable Development Goals for 2030.",
      "India is a founding member and top peacekeeping contributor.",
    ],
    example:
      "UNESCO's World Heritage Sites list protects places of outstanding value — India has sites like the Taj Mahal, Ajanta Caves and the Elephanta Caves.",
    practice: ["When was the UN founded and why?", "Name three UN specialised agencies and their work."],
  },
];

export const KNOWLEDGE_BY_SUBJECT = KNOWLEDGE.reduce<Record<string, KnowledgeTopic[]>>((acc, topic) => {
  (acc[topic.subject] ??= []).push(topic);
  return acc;
}, {});

/* ------------------------------ searching ----------------------------- */

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "of", "to", "in", "on", "for", "and", "or", "please",
  "can", "you", "me", "my", "i", "it", "this", "that", "what", "explain", "tell", "about", "how", "why",
  "do", "does", "help", "with", "give", "some", "teach", "learn", "study", "define", "meaning", "simple", "words", "briefly", "detail", "detailed", "example", "examples", "lesson", "topic", "process", "work", "works",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

export function searchTopics(query: string): { topic: KnowledgeTopic; score: number }[] {
  const words = tokenize(query);
  if (!words.length) return [];
  const scored: { topic: KnowledgeTopic; score: number }[] = [];
  for (const topic of KNOWLEDGE) {
    let score = 0;
    const title = topic.title.toLowerCase();
    const haystack = [
      topic.title,
      topic.id,
      ...topic.keywords,
      topic.simple,
      ...topic.deep,
      ...topic.keyPoints,
      topic.example,
      topic.story ?? "",
    ]
      .join(" ")
      .toLowerCase();

    // Never answer from a partial keyword match. Every meaningful query word
    // must be supported by this topic's curated content.
    const matchedWords = words.filter((word) => haystack.includes(word));
    if (matchedWords.length !== words.length) continue;

    for (const word of words) {
      if (title.includes(word)) score += 6;
      if (topic.keywords.some((k) => k.includes(word))) score += 5;
      if (topic.id.includes(word)) score += 4;
      score += 1;
    }
    if (score > 0) scored.push({ topic, score });
  }
  return scored.sort((a, b) => b.score - a.score);
}

export function findTopic(id: string): KnowledgeTopic | undefined {
  return KNOWLEDGE.find((t) => t.id === id);
}
