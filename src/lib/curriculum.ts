/**
 * Bundled curriculum content. This module is static app data, not learner storage.
 * It is shipped with HELIXEDU and remains available offline.
 */
export type LessonBlock =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[]; ordered?: boolean }
  | { kind: "example"; title?: string; text: string }
  | { kind: "tip"; text: string }
  | { kind: "formula"; text: string }
  | { kind: "code"; lang: string; code: string };

type SeedLesson = { slug: string; title: string; minutes: number; blocks: LessonBlock[] };
type SeedCard = { front: string; back: string; hint?: string };
type SeedQuestion = { prompt: string; options: string[]; answerIndex: number; explanation: string; difficulty?: "easy" | "medium" | "hard" };
type SeedQuiz = { slug: string; title: string; description: string; difficulty?: "easy" | "medium" | "hard"; timeLimitSec: number; questions: number[] };
type SeedChapter = { slug: string; title: string; summary: string; level?: "beginner" | "intermediate" | "advanced"; minutes?: number; lessons: SeedLesson[]; cards: SeedCard[]; questions: SeedQuestion[]; quizzes: SeedQuiz[] };
type SeedSubject = { slug: string; name: string; tagline: string; icon: string; color: string; chapters: SeedChapter[] };

export const CURRICULUM: SeedSubject[] = [
  /* ============================= MATHEMATICS ============================ */
  {
    slug: "mathematics",
    name: "Mathematics",
    tagline: "Numbers, patterns and the language of the universe",
    icon: "📐",
    color: "violet",
    chapters: [
      {
        slug: "math-number-systems",
        title: "Number Systems & Fractions",
        summary: "Whole numbers, integers, rational numbers and the arithmetic of fractions.",
        level: "beginner",
        minutes: 40,
        lessons: [
          {
            slug: "lesson-fractions-core",
            title: "Understanding and Operating on Fractions",
            minutes: 10,
            blocks: [
              { kind: "heading", text: "What a fraction really means" },
              {
                kind: "paragraph",
                text: "A fraction a/b is a division statement: a divided by b. The denominator tells you how many equal parts the whole was split into; the numerator tells you how many of those parts you hold.",
              },
              { kind: "formula", text: "a/b = a ÷ b" },
              { kind: "heading", text: "Adding and subtracting" },
              {
                kind: "paragraph",
                text: "You can only add pieces of the same size, so you need a common denominator. The lowest common denominator keeps the numbers small.",
              },
              { kind: "example", title: "Worked example", text: "1/2 + 1/3 = 3/6 + 2/6 = 5/6." },
              { kind: "heading", text: "Multiplying and dividing" },
              { kind: "list", items: ["Multiply straight across: (a/b) × (c/d) = ac/bd.", "Divide by multiplying with the reciprocal: (a/b) ÷ (c/d) = (a/b) × (d/c)."] },
              { kind: "tip", text: "Always simplify at the end by dividing top and bottom by their GCD." },
            ],
          },
          {
            slug: "lesson-decimals-percentages",
            title: "Decimals, Percentages and Ratio",
            minutes: 9,
            blocks: [
              { kind: "heading", text: "Percent means per hundred" },
              { kind: "formula", text: "percentage = (part ÷ whole) × 100" },
              { kind: "example", title: "Worked example", text: "15% of 240 = 0.15 × 240 = 36." },
              { kind: "heading", text: "Percentage change" },
              { kind: "formula", text: "% change = (change ÷ original value) × 100" },
              { kind: "tip", text: "Always divide by the ORIGINAL value, never the new one." },
              { kind: "heading", text: "Ratio" },
              { kind: "paragraph", text: "A ratio compares quantities of the same kind. To share ₹900 in the ratio 2:3, first add the parts (5), then give 2/5 and 3/5." },
              { kind: "example", title: "Worked example", text: "₹900 in ratio 2:3 → ₹360 and ₹540." },
            ],
          },
        ],
        cards: [
          { front: "What is 3/4 + 1/4?", back: "1 (four quarters make a whole).", hint: "Same denominator — just add the numerators." },
          { front: "How do you divide fractions?", back: "Multiply by the reciprocal of the second fraction: (a/b) ÷ (c/d) = (a/b) × (d/c).", hint: "Keep, change, flip." },
          { front: "Convert 0.35 to a percentage.", back: "35%.", hint: "Multiply by 100." },
          { front: "Simplify 18/24.", back: "3/4 (divide both by GCD 6).", hint: "Find the greatest common divisor first." },
          { front: "What is 12.5% of 80?", back: "10.", hint: "0.125 × 80." },
          { front: "Share 60 in the ratio 1:3.", back: "15 and 45.", hint: "Total parts = 4." },
        ],
        questions: [
          { prompt: "Simplify 24/36.", options: ["2/3", "3/4", "4/6", "6/9"], answerIndex: 0, explanation: "GCD(24,36) = 12, so 24/36 = 2/3." },
          { prompt: "What is 2/5 + 1/3?", options: ["3/8", "11/15", "1/2", "3/15"], answerIndex: 1, explanation: "Common denominator 15: 6/15 + 5/15 = 11/15." },
          { prompt: "20% of 250 is:", options: ["25", "50", "75", "100"], answerIndex: 1, explanation: "0.20 × 250 = 50." },
          { prompt: "Divide 3/4 by 2/5.", options: ["3/10", "6/20", "15/8", "8/15"], answerIndex: 2, explanation: "(3/4) × (5/2) = 15/8." },
          { prompt: "₹600 shared in the ratio 1:5 gives:", options: ["₹100 and ₹500", "₹60 and ₹540", "₹150 and ₹450", "₹120 and ₹480"], answerIndex: 0, explanation: "Total parts 6; 1/6 of 600 = 100." },
          { prompt: "0.075 as a percentage is:", options: ["0.75%", "7.5%", "75%", "750%"], answerIndex: 1, explanation: "0.075 × 100 = 7.5%." },
        ],
        quizzes: [
          {
            slug: "quiz-fractions-percentages",
            title: "Fractions, Decimals & Percentages",
            description: "Six quick questions on the arithmetic you use every single day.",
            difficulty: "easy",
            timeLimitSec: 300,
            questions: [0, 1, 2, 3, 4, 5],
          },
        ],
      },
      {
        slug: "math-algebra",
        title: "Algebra: Equations & Identities",
        summary: "Solving linear and quadratic equations and using algebraic identities.",
        level: "intermediate",
        minutes: 55,
        lessons: [
          {
            slug: "lesson-linear-equations",
            title: "Solving Linear Equations in One Variable",
            minutes: 11,
            blocks: [
              { kind: "heading", text: "The balance idea" },
              { kind: "paragraph", text: "An equation is a balance. Whatever you do to one side you must do to the other, or the equality breaks." },
              { kind: "heading", text: "Method" },
              { kind: "list", ordered: true, items: ["Remove brackets using the distributive law.", "Collect all variable terms on one side.", "Collect all plain numbers on the other.", "Divide by the coefficient of the variable.", "Substitute back to check."] },
              { kind: "example", title: "Worked example", text: "3(x - 2) = 15 → 3x - 6 = 15 → 3x = 21 → x = 7. Check: 3(7-2) = 15 ✓" },
              { kind: "tip", text: "When a term crosses the equals sign its sign flips." },
            ],
          },
          {
            slug: "lesson-quadratics",
            title: "Quadratic Equations and the Discriminant",
            minutes: 12,
            blocks: [
              { kind: "heading", text: "Standard form" },
              { kind: "formula", text: "ax² + bx + c = 0,  a ≠ 0" },
              { kind: "heading", text: "The quadratic formula" },
              { kind: "formula", text: "x = (-b ± √(b² - 4ac)) / 2a" },
              { kind: "heading", text: "The discriminant decides everything" },
              { kind: "list", items: ["D > 0 → two distinct real roots.", "D = 0 → two equal (repeated) real roots.", "D < 0 → no real roots."] },
              { kind: "example", title: "Worked example", text: "x² - 5x + 6 = 0: D = 25 - 24 = 1, x = (5 ± 1)/2 → x = 3 or x = 2." },
              { kind: "heading", text: "Useful shortcuts" },
              { kind: "list", items: ["Sum of roots = -b/a", "Product of roots = c/a"] },
            ],
          },
          {
            slug: "lesson-identities",
            title: "Algebraic Identities You Must Know",
            minutes: 8,
            blocks: [
              { kind: "heading", text: "The four core identities" },
              { kind: "formula", text: "(a + b)² = a² + 2ab + b²" },
              { kind: "formula", text: "(a - b)² = a² - 2ab + b²" },
              { kind: "formula", text: "a² - b² = (a + b)(a - b)" },
              { kind: "formula", text: "(x + a)(x + b) = x² + (a + b)x + ab" },
              { kind: "example", title: "Fast mental maths", text: "98² = (100 - 2)² = 10000 - 400 + 4 = 9604." },
              { kind: "tip", text: "Identities let you expand, factorise and compute squares in your head." },
            ],
          },
        ],
        cards: [
          { front: "Solve 2x + 5 = 17.", back: "x = 6.", hint: "Subtract 5, then divide by 2." },
          { front: "What does the discriminant tell you?", back: "The nature of the roots of a quadratic: two real, one repeated, or none.", hint: "D = b² - 4ac." },
          { front: "Factorise x² - 9.", back: "(x + 3)(x - 3).", hint: "Difference of two squares." },
          { front: "Expand (x + 4)².", back: "x² + 8x + 16.", hint: "a² + 2ab + b² with a = x, b = 4." },
          { front: "Sum of roots of 2x² - 8x + 6 = 0?", back: "4 (−b/a = 8/2).", hint: "−b/a." },
          { front: "If D = 0, the roots are:", back: "Real and equal (a repeated root).", hint: "One solution." },
        ],
        questions: [
          { prompt: "Solve 5x - 7 = 18.", options: ["x = 5", "x = 3", "x = 11", "x = 25"], answerIndex: 0, explanation: "5x = 25, x = 5." },
          { prompt: "The roots of x² - 7x + 12 = 0 are:", options: ["2 and 6", "3 and 4", "-3 and -4", "1 and 12"], answerIndex: 1, explanation: "Two numbers multiplying to 12 and adding to 7 are 3 and 4." },
          { prompt: "D = b² - 4ac is called the:", options: ["Denominator", "Discriminant", "Divisor", "Determinant"], answerIndex: 1, explanation: "The discriminant determines the nature of the roots." },
          { prompt: "(a - b)² equals:", options: ["a² - b²", "a² - 2ab + b²", "a² + 2ab + b²", "a² + b²"], answerIndex: 1, explanation: "The square of a difference expands with a minus middle term." },
          { prompt: "Factorise 4x² - 25.", options: ["(2x - 5)²", "(2x + 5)(2x - 5)", "(4x - 5)(x + 5)", "(2x + 25)(2x - 1)"], answerIndex: 1, explanation: "Difference of squares: (2x)² - 5²." },
          { prompt: "If x = 2 is a root of x² + kx - 6 = 0, then k =", options: ["-1", "1", "-2", "2"], answerIndex: 0, explanation: "4 + 2k - 6 = 0 → 2k = 2 → k = 1. Wait: 4 + 2k - 6 = 0 gives 2k = 2, so k = 1.", difficulty: "hard" },
        ],
        quizzes: [
          {
            slug: "quiz-linear-equations",
            title: "Linear Equations Sprint",
            description: "Solve fast. Five questions, five minutes.",
            difficulty: "easy",
            timeLimitSec: 300,
            questions: [0, 3, 1, 2, 4],
          },
          {
            slug: "quiz-quadratics",
            title: "Quadratics & Discriminant",
            description: "Roots, nature of roots and factorisation.",
            difficulty: "medium",
            timeLimitSec: 420,
            questions: [1, 2, 3, 5],
          },
        ],
      },
      {
        slug: "math-geometry",
        title: "Geometry & Trigonometry",
        summary: "Triangles, circles, Pythagoras and the trigonometric ratios.",
        level: "intermediate",
        minutes: 50,
        lessons: [
          {
            slug: "lesson-pythagoras",
            title: "Pythagoras Theorem",
            minutes: 9,
            blocks: [
              { kind: "heading", text: "Statement" },
              { kind: "formula", text: "a² + b² = c²  (c is the hypotenuse)" },
              { kind: "paragraph", text: "Valid only for right-angled triangles. The hypotenuse is the side opposite the right angle and is always the longest side." },
              { kind: "heading", text: "Finding a shorter side" },
              { kind: "formula", text: "a = √(c² - b²)" },
              { kind: "example", title: "Worked example", text: "Ladder 10 m, foot 6 m from wall: height = √(100 - 36) = 8 m." },
              { kind: "list", items: ["Pythagorean triples: 3-4-5, 5-12-13, 8-15-17, 7-24-25.", "The converse is true: if a² + b² = c², the triangle is right-angled."] },
            ],
          },
          {
            slug: "lesson-trigonometry",
            title: "Trigonometric Ratios",
            minutes: 11,
            blocks: [
              { kind: "heading", text: "SOH-CAH-TOA" },
              { kind: "formula", text: "sin θ = opposite/hypotenuse · cos θ = adjacent/hypotenuse · tan θ = opposite/adjacent" },
              { kind: "heading", text: "Standard values" },
              { kind: "list", items: ["sin 30° = 1/2, cos 30° = √3/2, tan 30° = 1/√3", "sin 45° = cos 45° = 1/√2, tan 45° = 1", "sin 60° = √3/2, cos 60° = 1/2, tan 60° = √3"] },
              { kind: "heading", text: "The fundamental identity" },
              { kind: "formula", text: "sin²θ + cos²θ = 1" },
              { kind: "example", title: "Height and distance", text: "Angle of elevation 30°, shadow 10 m → height = 10 × tan 30° = 10/√3 ≈ 5.77 m." },
            ],
          },
        ],
        cards: [
          { front: "State Pythagoras theorem.", back: "In a right-angled triangle, the square of the hypotenuse equals the sum of the squares of the other two sides.", hint: "a² + b² = c²." },
          { front: "sin 30° = ?", back: "1/2.", hint: "One of the three standard values to memorise." },
          { front: "tan 45° = ?", back: "1.", hint: "Opposite equals adjacent at 45°." },
          { front: "sin²θ + cos²θ = ?", back: "1.", hint: "The fundamental identity." },
          { front: "Which side is the hypotenuse?", back: "The side opposite the right angle — always the longest.", hint: "Opposite 90°." },
          { front: "Legs 9 and 12. Hypotenuse?", back: "15 (a 3-4-5 triple scaled by 3).", hint: "√(81 + 144)." },
        ],
        questions: [
          { prompt: "A right triangle has legs 6 cm and 8 cm. Its hypotenuse is:", options: ["10 cm", "12 cm", "14 cm", "48 cm"], answerIndex: 0, explanation: "√(36 + 64) = √100 = 10." },
          { prompt: "sin 30° equals:", options: ["√3/2", "1/2", "1/√2", "1"], answerIndex: 1, explanation: "A standard value worth memorising." },
          { prompt: "tan 45° equals:", options: ["0", "1/2", "1", "√3"], answerIndex: 2, explanation: "Opposite equals adjacent, so the ratio is 1." },
          { prompt: "The identity sin²θ + cos²θ equals:", options: ["0", "1", "2", "tan θ"], answerIndex: 1, explanation: "The fundamental trigonometric identity." },
          { prompt: "If the hypotenuse is 13 and one leg is 5, the other leg is:", options: ["8", "10", "12", "18"], answerIndex: 2, explanation: "√(169 - 25) = √144 = 12 (5-12-13 triple)." },
        ],
        quizzes: [
          { slug: "quiz-geometry-trig", title: "Geometry & Trigonometry Check", description: "Pythagoras, ratios and identities.", difficulty: "medium", timeLimitSec: 360, questions: [0, 1, 2, 3, 4] },
        ],
      },
      {
        slug: "math-statistics",
        title: "Statistics & Probability",
        summary: "Mean, median, mode and the basics of chance.",
        level: "beginner",
        minutes: 35,
        lessons: [
          {
            slug: "lesson-mean-median-mode",
            title: "Measures of Central Tendency",
            minutes: 8,
            blocks: [
              { kind: "heading", text: "Three ways to describe 'typical'" },
              { kind: "formula", text: "Mean = Σx / n" },
              { kind: "list", items: ["Mean: uses every value, but is pulled by outliers.", "Median: the middle value once the data is sorted; robust to outliers.", "Mode: the most frequent value; the only one usable for non-numeric data."] },
              { kind: "example", title: "Worked example", text: "12, 15, 15, 18, 20 → mean 16, median 15, mode 15, range 8." },
              { kind: "tip", text: "Even number of observations? The median is the average of the two middle values." },
            ],
          },
          {
            slug: "lesson-probability",
            title: "Introduction to Probability",
            minutes: 8,
            blocks: [
              { kind: "heading", text: "Definition" },
              { kind: "formula", text: "P(E) = number of favourable outcomes / total number of equally likely outcomes" },
              { kind: "list", items: ["0 ≤ P(E) ≤ 1", "P(E) + P(not E) = 1", "One die: 6 outcomes. Two dice: 36. A deck of cards: 52."] },
              { kind: "example", title: "Worked example", text: "P(even number on a die) = 3/6 = 1/2." },
              { kind: "tip", text: "For independent events, P(A and B) = P(A) × P(B). Multiply for AND, do not add." },
            ],
          },
        ],
        cards: [
          { front: "What is the median?", back: "The middle value of data arranged in ascending order.", hint: "Sort first." },
          { front: "P(not E) if P(E) = 0.35?", back: "0.65.", hint: "Probabilities add to 1." },
          { front: "Mean of 4, 8, 6, 10, 2?", back: "6 (30 ÷ 5).", hint: "Sum divided by count." },
          { front: "Which average is unaffected by outliers?", back: "The median.", hint: "It only cares about position." },
          { front: "P(head) when a fair coin is tossed?", back: "1/2.", hint: "Two equally likely outcomes." },
        ],
        questions: [
          { prompt: "The mean of 5, 8, 12, 20 is:", options: ["10", "11", "11.25", "12"], answerIndex: 2, explanation: "45 ÷ 4 = 11.25." },
          { prompt: "The median of 3, 7, 9, 11, 15 is:", options: ["7", "9", "11", "15"], answerIndex: 1, explanation: "Middle value of five sorted numbers." },
          { prompt: "P(getting a 5 on a fair die) is:", options: ["1/5", "1/6", "5/6", "1/2"], answerIndex: 1, explanation: "One favourable outcome out of six." },
          { prompt: "The mode of 2, 3, 3, 5, 7, 3, 9 is:", options: ["2", "3", "5", "7"], answerIndex: 1, explanation: "3 appears most often." },
          { prompt: "If P(rain) = 0.2, P(no rain) is:", options: ["0.2", "0.5", "0.8", "1.2"], answerIndex: 2, explanation: "Complement rule: 1 - 0.2." },
        ],
        quizzes: [
          { slug: "quiz-statistics-probability", title: "Statistics & Probability", description: "Averages and chance in five questions.", difficulty: "easy", timeLimitSec: 300, questions: [0, 1, 2, 3, 4] },
        ],
      },
    ],
  },

  /* =============================== SCIENCE ============================== */
  {
    slug: "science",
    name: "Science",
    tagline: "How the physical and living world actually works",
    icon: "🔬",
    color: "emerald",
    chapters: [
      {
        slug: "sci-life-processes",
        title: "Life Processes",
        summary: "Photosynthesis, respiration, digestion and circulation in living organisms.",
        level: "intermediate",
        minutes: 60,
        lessons: [
          {
            slug: "lesson-photosynthesis",
            title: "Photosynthesis",
            minutes: 10,
            blocks: [
              { kind: "heading", text: "The equation" },
              { kind: "formula", text: "6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂" },
              { kind: "paragraph", text: "Green plants convert light energy into chemical energy stored in glucose. It happens in the chloroplasts, using the pigment chlorophyll which absorbs red and blue light and reflects green — which is why leaves look green." },
              { kind: "heading", text: "Two stages" },
              { kind: "list", ordered: true, items: ["Light-dependent reactions in the thylakoid membranes: water is split, oxygen is released, ATP and NADPH are produced.", "The Calvin cycle in the stroma: CO₂ is fixed into glucose using that ATP and NADPH."] },
              { kind: "heading", text: "Limiting factors" },
              { kind: "list", items: ["Light intensity", "Carbon dioxide concentration", "Temperature"] },
              { kind: "tip", text: "Photosynthesis is the entry point of energy into nearly every food chain on Earth." },
            ],
          },
          {
            slug: "lesson-digestion",
            title: "Human Digestive System",
            minutes: 10,
            blocks: [
              { kind: "heading", text: "The journey of food" },
              { kind: "list", ordered: true, items: ["Mouth: salivary amylase begins starch digestion; the tongue forms a bolus.", "Stomach: HCl kills microbes and gives pepsin the right pH to start protein digestion.", "Small intestine: bile from the liver emulsifies fat; pancreatic juice adds trypsin, lipase and amylase.", "Villi absorb nutrients into the blood.", "Large intestine absorbs water; the rectum stores waste."] },
              { kind: "heading", text: "What the enzymes produce" },
              { kind: "list", items: ["Starch → maltose → glucose", "Protein → peptides → amino acids", "Fat → fatty acids + glycerol"] },
              { kind: "tip", text: "Bile is an emulsifier, not an enzyme — it breaks large fat droplets into small ones so lipase can work." },
            ],
          },
          {
            slug: "lesson-circulation",
            title: "Circulation and Blood",
            minutes: 9,
            blocks: [
              { kind: "heading", text: "The four-chambered heart" },
              { kind: "paragraph", text: "Right atrium → right ventricle → lungs → left atrium → left ventricle → body. This double circulation keeps oxygenated and deoxygenated blood separate." },
              { kind: "list", items: ["Arteries carry blood away from the heart (thick elastic walls, no valves).", "Veins carry blood back (thin walls, valves prevent backflow).", "Haemoglobin in red blood cells carries oxygen.", "Platelets clot blood; white blood cells fight infection."] },
              { kind: "tip", text: "The left ventricle wall is the thickest because it pumps blood to the entire body." },
            ],
          },
        ],
        cards: [
          { front: "Write the photosynthesis equation.", back: "6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂.", hint: "Carbon dioxide plus water, in light." },
          { front: "Which pigment captures light?", back: "Chlorophyll, inside the chloroplasts.", hint: "It reflects green light." },
          { front: "Where does most nutrient absorption happen?", back: "In the small intestine, through the villi.", hint: "Villi increase surface area." },
          { front: "Is bile an enzyme?", back: "No — it emulsifies fat, breaking large droplets into small ones.", hint: "Emulsifier, not enzyme." },
          { front: "How many chambers does the human heart have?", back: "Four: two atria and two ventricles.", hint: "Double circulation." },
          { front: "Which blood cells carry oxygen?", back: "Red blood cells, using haemoglobin.", hint: "RBCs." },
        ],
        questions: [
          { prompt: "The site of photosynthesis is the:", options: ["Mitochondria", "Chloroplast", "Nucleus", "Ribosome"], answerIndex: 1, explanation: "Chloroplasts contain chlorophyll and the machinery for both stages." },
          { prompt: "Which gas is released during photosynthesis?", options: ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"], answerIndex: 1, explanation: "Water is split in the light reactions, releasing O₂." },
          { prompt: "Bile is produced by the:", options: ["Pancreas", "Liver", "Stomach", "Gall bladder"], answerIndex: 1, explanation: "The liver makes bile; the gall bladder only stores it." },
          { prompt: "Nutrient absorption mainly happens in the:", options: ["Stomach", "Large intestine", "Small intestine", "Oesophagus"], answerIndex: 2, explanation: "Villi and microvilli in the small intestine absorb nutrients." },
          { prompt: "The pigment that carries oxygen in blood is:", options: ["Chlorophyll", "Haemoglobin", "Melanin", "Keratin"], answerIndex: 1, explanation: "Haemoglobin binds oxygen in red blood cells." },
          { prompt: "Arteries carry blood:", options: ["Towards the heart", "Away from the heart", "Only to the lungs", "Only deoxygenated blood"], answerIndex: 1, explanation: "Arteries always carry blood away from the heart." },
        ],
        quizzes: [
          { slug: "quiz-life-processes", title: "Life Processes", description: "Photosynthesis, digestion and circulation.", difficulty: "medium", timeLimitSec: 360, questions: [0, 1, 2, 3, 4, 5] },
        ],
      },
      {
        slug: "sci-matter",
        title: "Matter and Its Nature",
        summary: "Atoms, the periodic table, chemical reactions and states of matter.",
        level: "intermediate",
        minutes: 55,
        lessons: [
          {
            slug: "lesson-periodic-table",
            title: "The Modern Periodic Table",
            minutes: 11,
            blocks: [
              { kind: "heading", text: "Modern periodic law" },
              { kind: "paragraph", text: "The properties of elements are a periodic function of their atomic numbers. Elements are arranged in increasing atomic number so that elements with similar properties fall in the same group." },
              { kind: "list", items: ["18 groups (vertical) and 7 periods (horizontal).", "Across a period: atomic size decreases, metallic character decreases.", "Down a group: atomic size increases, metallic character increases.", "Group 1 alkali metals, Group 2 alkaline earth metals, Group 17 halogens, Group 18 noble gases."] },
              { kind: "example", title: "Why groups repeat properties", text: "Na (Z=11) and K (Z=19) are both in Group 1 and both have 1 valence electron, so both react vigorously with water." },
            ],
          },
          {
            slug: "lesson-chemical-reactions",
            title: "Types of Chemical Reactions",
            minutes: 10,
            blocks: [
              { kind: "heading", text: "Classification" },
              { kind: "list", items: ["Combination: A + B → AB (CaO + H₂O → Ca(OH)₂).", "Decomposition: AB → A + B (needs heat, light or electricity).", "Displacement: a more reactive element replaces a less reactive one (Zn + CuSO₄ → ZnSO₄ + Cu).", "Double displacement: ions exchange, often forming a precipitate."] },
              { kind: "heading", text: "Oxidation and reduction" },
              { kind: "list", items: ["Oxidation = gain of oxygen or loss of hydrogen.", "Reduction = loss of oxygen or gain of hydrogen.", "Both together = a redox reaction. Corrosion and rancidity are everyday redox reactions."] },
              { kind: "tip", text: "A balanced equation conserves mass: the same number of atoms of each element on both sides." },
            ],
          },
          {
            slug: "lesson-states-of-matter",
            title: "States of Matter",
            minutes: 8,
            blocks: [
              { kind: "paragraph", text: "Solids have fixed shape and volume with tightly packed particles. Liquids have fixed volume but take the shape of the container. Gases have neither." },
              { kind: "heading", text: "Changing state" },
              { kind: "list", items: ["Melting: solid → liquid. Freezing: liquid → solid.", "Evaporation/boiling: liquid → gas. Condensation: gas → liquid.", "Sublimation: solid → gas directly (camphor, naphthalene)."] },
              { kind: "tip", text: "Latent heat changes the state without changing the temperature. Evaporation causes cooling because the fastest particles escape." },
            ],
          },
        ],
        cards: [
          { front: "How many groups and periods are in the modern periodic table?", back: "18 groups and 7 periods.", hint: "Vertical and horizontal." },
          { front: "What happens to atomic size across a period?", back: "It decreases.", hint: "More protons pull electrons in tighter." },
          { front: "Define oxidation.", back: "Gain of oxygen or loss of hydrogen (also loss of electrons).", hint: "Remember OIL RIG." },
          { front: "Zn + CuSO₄ → ?", back: "ZnSO₄ + Cu — zinc displaces copper because zinc is more reactive.", hint: "Displacement reaction." },
          { front: "What is sublimation?", back: "A solid turning directly into a gas, e.g. camphor.", hint: "Skips the liquid stage." },
          { front: "Which group contains the noble gases?", back: "Group 18.", hint: "Full outer shell, so they are inert." },
        ],
        questions: [
          { prompt: "Elements in the modern periodic table are arranged by:", options: ["Atomic mass", "Atomic number", "Density", "Valency"], answerIndex: 1, explanation: "Modern periodic law uses atomic number." },
          { prompt: "Across a period, metallic character:", options: ["Increases", "Decreases", "Stays the same", "Doubles"], answerIndex: 1, explanation: "It decreases from metals on the left to non-metals on the right." },
          { prompt: "Zn + CuSO₄ → ZnSO₄ + Cu is a:", options: ["Combination", "Decomposition", "Displacement", "Double displacement"], answerIndex: 2, explanation: "A more reactive metal displaces a less reactive one." },
          { prompt: "Camphor disappearing without melting is:", options: ["Evaporation", "Sublimation", "Condensation", "Deposition"], answerIndex: 1, explanation: "Solid directly to gas." },
          { prompt: "The group of noble gases is:", options: ["1", "2", "17", "18"], answerIndex: 3, explanation: "Group 18 elements have full outer shells." },
        ],
        quizzes: [
          { slug: "quiz-matter-chemistry", title: "Matter & Chemical Reactions", description: "Periodic table, reaction types and states of matter.", difficulty: "medium", timeLimitSec: 360, questions: [0, 1, 2, 3, 4] },
        ],
      },
      {
        slug: "sci-force-energy",
        title: "Force, Motion and Energy",
        summary: "Newton's laws, work, energy, power and electricity.",
        level: "intermediate",
        minutes: 55,
        lessons: [
          {
            slug: "lesson-newtons-laws",
            title: "Newton's Laws of Motion",
            minutes: 11,
            blocks: [
              { kind: "heading", text: "First law — inertia" },
              { kind: "paragraph", text: "A body remains at rest or in uniform motion in a straight line unless acted upon by an external unbalanced force. This is why seatbelts matter." },
              { kind: "heading", text: "Second law" },
              { kind: "formula", text: "F = ma" },
              { kind: "paragraph", text: "Force equals mass times acceleration. Momentum p = mv, and force is the rate of change of momentum. 1 newton accelerates 1 kg at 1 m/s²." },
              { kind: "heading", text: "Third law" },
              { kind: "paragraph", text: "For every action there is an equal and opposite reaction, acting on a different body. A rocket pushes gas down; the gas pushes the rocket up." },
              { kind: "tip", text: "Action and reaction never cancel each other because they act on different bodies." },
            ],
          },
          {
            slug: "lesson-work-energy",
            title: "Work, Energy and Power",
            minutes: 9,
            blocks: [
              { kind: "formula", text: "Work = Force × displacement in the direction of the force" },
              { kind: "formula", text: "Kinetic energy = ½mv² · Potential energy = mgh" },
              { kind: "paragraph", text: "Energy cannot be created or destroyed, only transformed. Power is the rate of doing work, measured in watts (1 W = 1 J/s)." },
              { kind: "example", title: "Worked example", text: "Lifting 2 kg by 3 m: work = mgh = 2 × 9.8 × 3 = 58.8 J." },
            ],
          },
          {
            slug: "lesson-electricity",
            title: "Electric Current and Circuits",
            minutes: 10,
            blocks: [
              { kind: "heading", text: "Ohm's law" },
              { kind: "formula", text: "V = IR" },
              { kind: "list", items: ["Ammeter in series (low resistance); voltmeter in parallel (high resistance).", "Series: resistances add, same current everywhere.", "Parallel: 1/R = 1/R₁ + 1/R₂, same voltage across each branch."] },
              { kind: "heading", text: "Power and energy" },
              { kind: "formula", text: "P = VI = I²R = V²/R · Energy = Power × time (kWh)" },
              { kind: "example", title: "Worked example", text: "A 100 W bulb run for 10 hours uses 1 kWh = 1 unit of electricity." },
            ],
          },
        ],
        cards: [
          { front: "State Newton's second law.", back: "F = ma — force equals mass times acceleration.", hint: "The most used law in physics." },
          { front: "SI unit of power?", back: "Watt (W) = joule per second.", hint: "Rate of doing work." },
          { front: "Kinetic energy formula?", back: "½mv².", hint: "Half mass velocity squared." },
          { front: "State Ohm's law.", back: "V = IR at constant temperature.", hint: "Voltage equals current times resistance." },
          { front: "Resistors in series — total resistance?", back: "R = R₁ + R₂ + R₃ (they simply add).", hint: "Same current flows through all." },
          { front: "1 kWh equals?", back: "1 unit of electrical energy = 3.6 × 10⁶ J.", hint: "What your electricity bill counts." },
        ],
        questions: [
          { prompt: "Newton's second law is written as:", options: ["E = mc²", "F = ma", "V = IR", "p = mv"], answerIndex: 1, explanation: "Force equals mass times acceleration." },
          { prompt: "The SI unit of power is the:", options: ["Joule", "Newton", "Watt", "Pascal"], answerIndex: 2, explanation: "1 W = 1 J/s." },
          { prompt: "Kinetic energy of a body is:", options: ["mgh", "½mv²", "mv", "Fd"], answerIndex: 1, explanation: "Half mass times velocity squared." },
          { prompt: "Two 6 Ω resistors in parallel give:", options: ["12 Ω", "6 Ω", "3 Ω", "1 Ω"], answerIndex: 2, explanation: "1/R = 1/6 + 1/6 = 2/6, so R = 3 Ω." },
          { prompt: "An ammeter should be connected:", options: ["In parallel", "In series", "Across the supply", "Not at all"], answerIndex: 1, explanation: "In series, so all the current passes through it." },
          { prompt: "1 kWh = 1 unit of energy equals:", options: ["3600 J", "3.6 × 10⁶ J", "1000 J", "10⁶ J"], answerIndex: 1, explanation: "1000 W × 3600 s." },
        ],
        quizzes: [
          { slug: "quiz-force-energy", title: "Force, Motion & Electricity", description: "Newton's laws, energy and circuits.", difficulty: "medium", timeLimitSec: 420, questions: [0, 1, 2, 3, 4, 5] },
        ],
      },
      {
        slug: "sci-living-world",
        title: "The Living World",
        summary: "Cells, heredity, evolution and human body systems.",
        level: "intermediate",
        minutes: 45,
        lessons: [
          {
            slug: "lesson-cell",
            title: "The Cell and Its Organelles",
            minutes: 10,
            blocks: [
              { kind: "paragraph", text: "The cell is the structural and functional unit of life. Plant and animal cells are eukaryotic — they have a true nucleus and membrane-bound organelles." },
              { kind: "list", items: ["Cell membrane: selectively permeable boundary.", "Nucleus: contains DNA, controls cell activities.", "Mitochondria: aerobic respiration, produces ATP.", "Ribosomes: protein synthesis. ER: transport. Golgi: packaging.", "Lysosomes: digestive enzymes ('suicide bags').", "Plant-only: cell wall (cellulose), chloroplasts, large central vacuole."] },
              { kind: "tip", text: "Prokaryotic cells such as bacteria have no membrane-bound nucleus — their DNA lies free in the cytoplasm." },
            ],
          },
          {
            slug: "lesson-heredity",
            title: "Heredity and Evolution",
            minutes: 10,
            blocks: [
              { kind: "heading", text: "Mendel's laws" },
              { kind: "list", items: ["Law of dominance: the dominant trait masks the recessive one.", "Law of segregation: allele pairs separate during gamete formation.", "Law of independent assortment: different genes are inherited independently."] },
              { kind: "example", title: "Monohybrid cross", text: "Tt × Tt gives a 3:1 tall:dwarf ratio in the F₂ generation." },
              { kind: "heading", text: "Natural selection" },
              { kind: "paragraph", text: "Individuals with favourable variations survive and reproduce more successfully, so those variations become common in the population over generations." },
              { kind: "list", items: ["Evidence: fossils, homologous organs, embryology.", "Acquired traits are NOT inherited — only changes in germ cells are."] },
            ],
          },
        ],
        cards: [
          { front: "Which organelle is called the powerhouse of the cell?", back: "The mitochondrion — it produces ATP.", hint: "Site of aerobic respiration." },
          { front: "Three structures found in plant cells but not animal cells?", back: "Cell wall, chloroplasts and a large central vacuole.", hint: "Wall, green pigment, big storage." },
          { front: "F₂ phenotypic ratio of a monohybrid cross?", back: "3:1.", hint: "Mendel's pea experiment." },
          { front: "Are acquired characters inherited?", back: "No — only changes in the germ cells are inherited.", hint: "A bodybuilder's muscles do not pass on." },
          { front: "What is a prokaryotic cell?", back: "A cell without a membrane-bound nucleus, e.g. bacteria.", hint: "No true nucleus." },
        ],
        questions: [
          { prompt: "The powerhouse of the cell is the:", options: ["Nucleus", "Mitochondrion", "Ribosome", "Vacuole"], answerIndex: 1, explanation: "Mitochondria produce ATP through respiration." },
          { prompt: "Which is found only in plant cells?", options: ["Cell membrane", "Nucleus", "Chloroplast", "Cytoplasm"], answerIndex: 2, explanation: "Chloroplasts (and cell walls) are plant-only." },
          { prompt: "The F₂ ratio of a monohybrid cross is:", options: ["1:1", "3:1", "9:3:3:1", "1:2:1"], answerIndex: 1, explanation: "Mendel's classic result." },
          { prompt: "Bacteria are:", options: ["Eukaryotic", "Prokaryotic", "Multicellular", "Fungi"], answerIndex: 1, explanation: "They lack a membrane-bound nucleus." },
          { prompt: "The strongest direct evidence for evolution comes from:", options: ["Fossils", "Guesswork", "Photographs", "Myths"], answerIndex: 0, explanation: "Fossils show a record of change over time." },
        ],
        quizzes: [
          { slug: "quiz-living-world", title: "Cells, Heredity & Evolution", description: "Organelles, Mendel and natural selection.", difficulty: "medium", timeLimitSec: 360, questions: [0, 1, 2, 3, 4] },
        ],
      },
    ],
  },

  /* =============================== ENGLISH ============================== */
  {
    slug: "english",
    name: "English",
    tagline: "Grammar, writing and communication that actually land",
    icon: "📖",
    color: "cyan",
    chapters: [
      {
        slug: "eng-grammar",
        title: "Grammar Essentials",
        summary: "Parts of speech, tenses and voice — the backbone of clear English.",
        level: "beginner",
        minutes: 40,
        lessons: [
          {
            slug: "lesson-parts-of-speech",
            title: "The Eight Parts of Speech",
            minutes: 9,
            blocks: [
              { kind: "list", items: ["Noun — names a person, place, thing or idea.", "Pronoun — replaces a noun (he, she, which).", "Verb — an action or state of being.", "Adjective — describes a noun. Adverb — describes a verb, adjective or adverb.", "Preposition — shows relationship (in, on, under).", "Conjunction — joins words or clauses (and, but, because).", "Interjection — a sudden expression of feeling."] },
              { kind: "tip", text: "FANBOYS = for, and, nor, but, or, yet, so — the coordinating conjunctions." },
              { kind: "example", title: "Spot the parts", text: "'The quick brown fox jumps swiftly over the lazy dog' — quick, brown, lazy are adjectives; jumps is a verb; swiftly is an adverb; over is a preposition." },
            ],
          },
          {
            slug: "lesson-tenses",
            title: "Tenses: Twelve Forms, One System",
            minutes: 11,
            blocks: [
              { kind: "paragraph", text: "Three times (past, present, future) × four aspects (simple, continuous, perfect, perfect continuous) give twelve tenses." },
              { kind: "list", items: ["Present simple: habitual facts. 'She writes every day.'", "Present continuous: happening now. 'She is writing.'", "Present perfect: completed with present relevance. 'She has written three letters.'", "Past simple: finished at a specific time. 'She wrote yesterday.'", "Past perfect: the earlier of two past actions. 'She had written before he arrived.'"] },
              { kind: "tip", text: "Signal words: since/for with perfect tenses, while with continuous, already/yet/just with perfect." },
            ],
          },
          {
            slug: "lesson-voice",
            title: "Active and Passive Voice",
            minutes: 8,
            blocks: [
              { kind: "paragraph", text: "Active: the subject does the action. Passive: the subject receives it. Only transitive verbs can be made passive." },
              { kind: "formula", text: "Passive = object + be (correct tense) + past participle + by + subject" },
              { kind: "example", title: "Conversion", text: "'The scientist discovered the vaccine' → 'The vaccine was discovered by the scientist.'" },
              { kind: "tip", text: "Tense never changes when you convert. Use the passive when the action matters more than the doer." },
            ],
          },
        ],
        cards: [
          { front: "How many parts of speech does English have?", back: "Eight.", hint: "Noun, pronoun, verb, adjective, adverb, preposition, conjunction, interjection." },
          { front: "What does an adverb modify?", back: "A verb, an adjective or another adverb.", hint: "It answers how, when, where or how much." },
          { front: "Change to passive: 'They are building a bridge.'", back: "'A bridge is being built (by them).'", hint: "be + past participle." },
          { front: "FANBOYS stands for?", back: "For, And, Nor, But, Or, Yet, So.", hint: "Coordinating conjunctions." },
          { front: "Present perfect of 'write'?", back: "'has/have written'.", hint: "has/have + past participle." },
          { front: "Which tense: 'I have been studying since 7 p.m.'?", back: "Present perfect continuous.", hint: "Started in the past, still going on." },
        ],
        questions: [
          { prompt: "Which word is an adverb? 'She ran quickly.'", options: ["She", "ran", "quickly", "She ran"], answerIndex: 2, explanation: "'Quickly' describes how she ran." },
          { prompt: "The passive of 'They are building a bridge' is:", options: ["A bridge is built by them", "A bridge is being built by them", "A bridge was built by them", "They built a bridge"], answerIndex: 1, explanation: "Present continuous passive: is/are + being + past participle." },
          { prompt: "'Since' and 'for' are typically used with:", options: ["Simple tenses", "Perfect tenses", "Future tenses", "Continuous tenses"], answerIndex: 1, explanation: "They signal perfect tenses." },
          { prompt: "FANBOYS is a mnemonic for:", options: ["Prepositions", "Coordinating conjunctions", "Interjections", "Articles"], answerIndex: 1, explanation: "For, And, Nor, But, Or, Yet, So." },
          { prompt: "'I have been waiting for an hour' is:", options: ["Present perfect", "Present perfect continuous", "Past continuous", "Future perfect"], answerIndex: 1, explanation: "has/have + been + verb-ing." },
        ],
        quizzes: [
          { slug: "quiz-english-grammar", title: "Grammar Check", description: "Parts of speech, tenses and voice.", difficulty: "easy", timeLimitSec: 300, questions: [0, 1, 2, 3, 4] },
        ],
      },
      {
        slug: "eng-writing",
        title: "Writing Skills",
        summary: "Paragraphs, essays, letters and figures of speech.",
        level: "intermediate",
        minutes: 45,
        lessons: [
          {
            slug: "lesson-essay-writing",
            title: "Essay and Paragraph Writing",
            minutes: 10,
            blocks: [
              { kind: "heading", text: "Structure" },
              { kind: "list", ordered: true, items: ["Introduction: hook + the topic + your position.", "Body paragraphs: one idea each, in PEEL order (Point, Evidence, Explanation, Link).", "Conclusion: summarise and end with a call to action or a forward look."] },
              { kind: "tip", text: "Plan for two minutes before you write for twenty. It saves more time than it costs." },
              { kind: "heading", text: "Linking words" },
              { kind: "list", items: ["Adding: moreover, in addition, furthermore.", "Contrasting: however, nevertheless, on the other hand.", "Concluding: therefore, in conclusion, consequently."] },
            ],
          },
          {
            slug: "lesson-figurative",
            title: "Figures of Speech",
            minutes: 8,
            blocks: [
              { kind: "list", items: ["Simile — comparison using like/as: 'as brave as a lion'.", "Metaphor — direct comparison: 'the classroom was a zoo'.", "Personification — human traits for non-human things: 'the wind whispered'.", "Hyperbole — deliberate exaggeration: 'a thousand times'.", "Alliteration — repeated initial sounds: 'Peter Piper picked'.", "Onomatopoeia — words that imitate sounds: buzz, clang."] },
              { kind: "tip", text: "In exams, name the device AND explain its effect — the effect is where the marks are." },
            ],
          },
          {
            slug: "lesson-letters",
            title: "Formal and Informal Letters",
            minutes: 9,
            blocks: [
              { kind: "heading", text: "Formal letter format" },
              { kind: "list", ordered: true, items: ["Sender's address", "Date", "Receiver's designation and address", "Subject line", "Salutation (Dear Sir/Madam)", "Body: purpose in paragraph 1, details in paragraph 2, action requested in paragraph 3", "Subscription (Yours faithfully/sincerely) + name"] },
              { kind: "tip", text: "Formal = no contractions, no slang, polite requests. Informal = first person, friendly, conversational." },
            ],
          },
        ],
        cards: [
          { front: "What does PEEL stand for?", back: "Point, Evidence, Explanation, Link.", hint: "Paragraph structure." },
          { front: "Simile or metaphor? 'Her smile was sunshine.'", back: "Metaphor — a direct comparison with no 'like' or 'as'.", hint: "No like/as means metaphor." },
          { front: "What is personification?", back: "Giving human qualities to non-human things.", hint: "'The wind whispered.'" },
          { front: "Close a formal letter that starts 'Dear Sir'.", back: "'Yours faithfully'.", hint: "Faithful when you do not know the name." },
          { front: "What is alliteration?", back: "Repetition of the same initial consonant sound.", hint: "'Sally sells sea shells.'" },
        ],
        questions: [
          { prompt: "'Her smile was a ray of sunshine' is a:", options: ["Simile", "Metaphor", "Hyperbole", "Onomatopoeia"], answerIndex: 1, explanation: "A direct comparison without 'like' or 'as'." },
          { prompt: "PEEL stands for:", options: ["Point, Evidence, Explanation, Link", "Plan, Edit, Explain, List", "Point, Example, End, Link", "Purpose, Evidence, Effect, Length"], answerIndex: 0, explanation: "A reliable paragraph structure." },
          { prompt: "Which is personification?", options: ["'As busy as a bee'", "'The wind whispered through the trees'", "'Boom went the drum'", "'Peter Piper picked'"], answerIndex: 1, explanation: "The wind is given a human action." },
          { prompt: "A letter beginning 'Dear Sir' should end:", options: ["Yours sincerely", "Yours faithfully", "Love", "Best wishes"], answerIndex: 1, explanation: "'Faithfully' when the name is unknown." },
        ],
        quizzes: [
          { slug: "quiz-english-writing", title: "Writing & Figures of Speech", description: "Devices, structure and letter format.", difficulty: "easy", timeLimitSec: 300, questions: [0, 1, 2, 3] },
        ],
      },
    ],
  },

  /* =============================== HISTORY ============================== */
  {
    slug: "history",
    name: "History",
    tagline: "Decisions, empires and turning points that shaped today",
    icon: "🏛️",
    color: "amber",
    chapters: [
      {
        slug: "hist-india-modern",
        title: "Modern India: The Freedom Struggle",
        summary: "From 1857 to 1947 — the movements, leaders and ideas that won independence.",
        level: "intermediate",
        minutes: 50,
        lessons: [
          {
            slug: "lesson-1857",
            title: "The Revolt of 1857",
            minutes: 10,
            blocks: [
              { kind: "paragraph", text: "The Revolt of 1857 began with sepoys at Meerut on 10 May 1857. Though it was suppressed, it ended East India Company rule: in 1858 the British Crown took direct control of India." },
              { kind: "list", items: ["Immediate cause: greased cartridges said to contain cow and pig fat.", "Leaders: Bahadur Shah Zafar (nominal), Nana Saheb, Tantia Tope, Rani Lakshmibai of Jhansi, Begum Hazrat Mahal.", "Why it failed: it was localised, poorly coordinated and lacked a unified vision.", "Result: end of Company rule; policy of annexation abandoned; princes assured of their states."] },
              { kind: "tip", text: "It is called the First War of Independence because it was the first large armed challenge to British rule." },
            ],
          },
          {
            slug: "lesson-gandhian-era",
            title: "The Gandhian Movements",
            minutes: 11,
            blocks: [
              { kind: "list", ordered: true, items: ["1919: Jallianwala Bagh massacre at Amritsar under General Dyer — a turning point.", "1920–22: Non-Cooperation Movement — boycott of British goods, titles, schools and courts.", "1930: Dandi Salt March and Civil Disobedience — breaking the salt monopoly.", "1942: Quit India Movement — 'Do or Die'."] },
              { kind: "paragraph", text: "Gandhi's tools were satyagraha (truth-force), non-violence and mass participation, which turned an elite movement into a national one." },
              { kind: "example", title: "The Dandi March", text: "Walking 240 miles to the sea to make salt turned a small act of defiance into a mass symbol of independence." },
              { kind: "tip", text: "Alongside the Gandhian strand ran the revolutionary strand: Bhagat Singh, Chandrashekhar Azad and Subhas Chandra Bose's Indian National Army." },
            ],
          },
        ],
        cards: [
          { front: "When did the Revolt of 1857 begin?", back: "10 May 1857, at Meerut.", hint: "Sepoys rose against greased cartridges." },
          { front: "What did the British Crown take over in 1858?", back: "Direct control of India from the East India Company.", hint: "End of Company rule." },
          { front: "Gandhi's three mass movements?", back: "Non-Cooperation (1920), Civil Disobedience (1930), Quit India (1942).", hint: "In that order." },
          { front: "What was the Dandi March?", back: "A 240-mile march to the sea to make salt, breaking the British salt monopoly.", hint: "1930." },
          { front: "Who led the Indian National Army?", back: "Subhas Chandra Bose.", hint: "Netaji." },
        ],
        questions: [
          { prompt: "The Revolt of 1857 began at:", options: ["Delhi", "Meerut", "Kanpur", "Lucknow"], answerIndex: 1, explanation: "Sepoys rose at Meerut on 10 May 1857 and marched to Delhi." },
          { prompt: "Company rule ended in India in:", options: ["1857", "1858", "1861", "1885"], answerIndex: 1, explanation: "The Government of India Act 1858 transferred power to the Crown." },
          { prompt: "The Dandi Salt March took place in:", options: ["1919", "1920", "1930", "1942"], answerIndex: 2, explanation: "It launched the Civil Disobedience Movement." },
          { prompt: "'Do or Die' was the slogan of the:", options: ["Non-Cooperation Movement", "Civil Disobedience Movement", "Quit India Movement", "Swadeshi Movement"], answerIndex: 2, explanation: "Gandhi's call in August 1942." },
          { prompt: "The Jallianwala Bagh massacre occurred in:", options: ["1918", "1919", "1920", "1922"], answerIndex: 1, explanation: "13 April 1919, under General Dyer." },
        ],
        quizzes: [
          { slug: "quiz-freedom-struggle", title: "The Freedom Struggle", description: "1857 to 1947 — movements, dates and leaders.", difficulty: "medium", timeLimitSec: 360, questions: [0, 1, 2, 3, 4] },
        ],
      },
      {
        slug: "hist-world",
        title: "World History: Revolutions and Wars",
        summary: "The French Revolution, the Industrial Revolution and the World Wars.",
        level: "intermediate",
        minutes: 45,
        lessons: [
          {
            slug: "lesson-french-revolution",
            title: "The French Revolution",
            minutes: 10,
            blocks: [
              { kind: "paragraph", text: "French society had three estates: the clergy, the nobility and everyone else. Only the Third Estate paid taxes — the core injustice that exploded in 1789." },
              { kind: "list", ordered: true, items: ["14 July 1789: the Bastille is stormed — the symbolic start.", "The National Assembly issues the Declaration of the Rights of Man and of the Citizen.", "1793: Louis XVI and Marie Antoinette are executed; the Reign of Terror follows under Robespierre.", "1799: Napoleon Bonaparte seizes power and spreads the Napoleonic Code across Europe."] },
              { kind: "tip", text: "The ideals — liberty, equality, fraternity — became France's motto and inspired democratic movements worldwide." },
            ],
          },
          {
            slug: "lesson-world-wars",
            title: "The Two World Wars",
            minutes: 11,
            blocks: [
              { kind: "heading", text: "First World War (1914–1918)" },
              { kind: "list", items: ["Trigger: the assassination of Archduke Franz Ferdinand of Austria.", "Allies: Britain, France, Russia, later the USA. Central Powers: Germany, Austria-Hungary, the Ottoman Empire.", "The Treaty of Versailles (1919) imposed harsh terms on Germany, creating the resentment that fed Nazism."] },
              { kind: "heading", text: "Second World War (1939–1945)" },
              { kind: "list", items: ["Germany invaded Poland in 1939. Axis: Germany, Italy, Japan.", "Turning points: Battle of Britain, Pearl Harbor (1941), Stalingrad (1942–43), D-Day (1944).", "The Holocaust: the Nazi genocide of six million Jews and millions of others.", "Ended with Germany's surrender in May 1945 and the atomic bombings of Hiroshima and Nagasaki in August 1945."] },
              { kind: "tip", text: "The United Nations was founded in 1945 precisely because the League of Nations had failed to prevent war." },
            ],
          },
        ],
        cards: [
          { front: "When was the Bastille stormed?", back: "14 July 1789.", hint: "Now France's national day." },
          { front: "Which estate paid the taxes?", back: "The Third Estate — peasants, workers and the bourgeoisie.", hint: "Everyone except clergy and nobility." },
          { front: "What sparked the First World War?", back: "The assassination of Archduke Franz Ferdinand.", hint: "1914." },
          { front: "When was the UN founded?", back: "1945, after the Second World War.", hint: "It replaced the failed League of Nations." },
          { front: "What was the Holocaust?", back: "The Nazi genocide of six million Jews and millions of others.", hint: "1941–1945." },
        ],
        questions: [
          { prompt: "The Bastille was stormed on:", options: ["14 July 1789", "14 July 1799", "4 July 1776", "1 May 1789"], answerIndex: 0, explanation: "The symbolic start of the French Revolution." },
          { prompt: "The First World War was triggered by the assassination of:", options: ["Kaiser Wilhelm II", "Archduke Franz Ferdinand", "Tsar Nicholas II", "King George V"], answerIndex: 1, explanation: "Heir to the Austro-Hungarian throne, killed at Sarajevo in 1914." },
          { prompt: "The Treaty of Versailles was signed in:", options: ["1914", "1918", "1919", "1920"], answerIndex: 2, explanation: "It formally ended the First World War." },
          { prompt: "The United Nations was founded in:", options: ["1919", "1939", "1945", "1950"], answerIndex: 2, explanation: "After the Second World War, replacing the League of Nations." },
          { prompt: "The Second World War ended in:", options: ["1943", "1944", "1945", "1946"], answerIndex: 2, explanation: "Germany surrendered in May and Japan in August 1945." },
        ],
        quizzes: [
          { slug: "quiz-world-history", title: "Revolutions & World Wars", description: "Dates, causes and consequences.", difficulty: "medium", timeLimitSec: 360, questions: [0, 1, 2, 3, 4] },
        ],
      },
    ],
  },

  /* ============================== GEOGRAPHY ============================= */
  {
    slug: "geography",
    name: "Geography",
    tagline: "Land, climate, resources and the map of our world",
    icon: "🌍",
    color: "emerald",
    chapters: [
      {
        slug: "geo-physical",
        title: "Physical Geography",
        summary: "The solar system, rocks, weathering and landforms.",
        level: "beginner",
        minutes: 40,
        lessons: [
          {
            slug: "lesson-solar-system",
            title: "The Solar System",
            minutes: 9,
            blocks: [
              { kind: "paragraph", text: "The Sun holds 99.86% of the solar system's mass. Eight planets orbit it: four rocky (Mercury, Venus, Earth, Mars) and four giants (Jupiter, Saturn, Uranus, Neptune)." },
              { kind: "tip", text: "Memory trick: 'My Very Educated Mother Just Served Us Noodles.'" },
              { kind: "list", items: ["The asteroid belt lies between Mars and Jupiter.", "Pluto was reclassified as a dwarf planet in 2006.", "Venus is the hottest planet because of its runaway greenhouse effect, even though Mercury is closer to the Sun."] },
            ],
          },
          {
            slug: "lesson-rocks",
            title: "Rocks and the Rock Cycle",
            minutes: 10,
            blocks: [
              { kind: "list", items: ["Igneous: formed from cooled magma/lava. Granite cools slowly underground; basalt cools quickly at the surface.", "Sedimentary: formed from deposited and cemented layers. Fossils are found almost only here — sandstone, limestone, shale, coal.", "Metamorphic: existing rocks changed by heat and pressure. Marble comes from limestone; slate from shale."] },
              { kind: "tip", text: "Weathering breaks rock in place, erosion transports it, deposition lays it down — together they shape every landform." },
            ],
          },
        ],
        cards: [
          { front: "List the planets in order from the Sun.", back: "Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.", hint: "My Very Educated Mother…" },
          { front: "Where is the asteroid belt?", back: "Between Mars and Jupiter.", hint: "Between rocky and gas planets." },
          { front: "Which rock type contains fossils?", back: "Sedimentary rock.", hint: "Formed in layers that preserve remains." },
          { front: "Marble is formed from which rock?", back: "Limestone (a metamorphic transformation).", hint: "Heat and pressure." },
          { front: "Why is Venus hotter than Mercury?", back: "Its thick CO₂ atmosphere traps heat in a runaway greenhouse effect.", hint: "Atmosphere, not distance." },
        ],
        questions: [
          { prompt: "The largest planet in the solar system is:", options: ["Earth", "Saturn", "Jupiter", "Neptune"], answerIndex: 2, explanation: "Jupiter is more massive than all other planets combined." },
          { prompt: "The asteroid belt lies between:", options: ["Earth and Mars", "Mars and Jupiter", "Jupiter and Saturn", "Venus and Earth"], answerIndex: 1, explanation: "Between the rocky planets and the gas giants." },
          { prompt: "Fossils are most commonly found in:", options: ["Igneous rock", "Sedimentary rock", "Metamorphic rock", "Magma"], answerIndex: 1, explanation: "Layered sedimentary rock preserves remains." },
          { prompt: "Marble is a metamorphic form of:", options: ["Granite", "Sandstone", "Limestone", "Basalt"], answerIndex: 2, explanation: "Heat and pressure transform limestone into marble." },
          { prompt: "The hottest planet is:", options: ["Mercury", "Venus", "Mars", "Jupiter"], answerIndex: 1, explanation: "Venus, due to its thick CO₂ atmosphere." },
        ],
        quizzes: [
          { slug: "quiz-physical-geography", title: "Physical Geography", description: "The solar system and the rock cycle.", difficulty: "easy", timeLimitSec: 300, questions: [0, 1, 2, 3, 4] },
        ],
      },
      {
        slug: "geo-india-climate",
        title: "India: Climate, Resources and Maps",
        summary: "The monsoon, natural resources and map-reading skills.",
        level: "intermediate",
        minutes: 45,
        lessons: [
          {
            slug: "lesson-monsoon",
            title: "The Monsoon",
            minutes: 10,
            blocks: [
              { kind: "paragraph", text: "In summer the land heats faster than the ocean, creating low pressure over India that pulls in moist air from the Indian Ocean. This is the southwest monsoon, arriving around 1 June in Kerala." },
              { kind: "list", items: ["The Western Ghats and the Himalayas force the air upward, causing heavy orographic rainfall.", "The windward side gets over 250 cm of rain while the leeward Deccan plateau sits in a rain shadow.", "From October the monsoon retreats, picking up moisture from the Bay of Bengal and giving Tamil Nadu its winter rain.", "Mawsynram and Cherrapunji are among the wettest places on Earth."] },
              { kind: "tip", text: "Indian agriculture depends on the monsoon — its failure means drought and crop loss." },
            ],
          },
          {
            slug: "lesson-maps",
            title: "Maps, Scale and Coordinates",
            minutes: 9,
            blocks: [
              { kind: "formula", text: "Scale = map distance ÷ ground distance" },
              { kind: "list", items: ["Latitude runs east–west, 0° at the equator to 90° at the poles.", "Longitude runs north–south, 0° at Greenwich to 180°.", "Contour lines join points of equal height — close contours mean a steep slope.", "Standard colours: blue water, green lowland, brown highland."] },
              { kind: "example", title: "Worked example", text: "On a 1:25,000 map, 4 cm = 4 × 250 m = 1 km on the ground." },
            ],
          },
        ],
        cards: [
          { front: "When does the southwest monsoon reach Kerala?", back: "Around 1 June.", hint: "The monsoon's Indian arrival date." },
          { front: "Why does Tamil Nadu get rain in winter?", back: "The retreating monsoon picks up moisture from the Bay of Bengal.", hint: "October–December." },
          { front: "What does a scale of 1:50,000 mean?", back: "1 cm on the map = 50,000 cm (500 m) on the ground.", hint: "Divide by 100 to get metres." },
          { front: "Close contour lines indicate:", back: "A steep slope.", hint: "Height changes quickly over a short distance." },
          { front: "Which parallel is the Tropic of Cancer?", back: "23.5°N.", hint: "Passes through the middle of India." },
        ],
        questions: [
          { prompt: "The southwest monsoon usually reaches Kerala around:", options: ["1 June", "1 July", "1 October", "1 May"], answerIndex: 0, explanation: "This is the standard date of the monsoon's onset." },
          { prompt: "Tamil Nadu receives most of its rainfall in:", options: ["June–September", "October–December", "March–May", "January–February"], answerIndex: 1, explanation: "From the retreating monsoon picking up Bay of Bengal moisture." },
          { prompt: "On a 1:25,000 map, 4 cm represents:", options: ["100 m", "500 m", "1 km", "4 km"], answerIndex: 2, explanation: "4 × 250 m = 1000 m." },
          { prompt: "Closely spaced contour lines mean:", options: ["Flat land", "A steep slope", "A river", "A plateau"], answerIndex: 1, explanation: "Height changes rapidly over a short distance." },
          { prompt: "The Tropic of Cancer lies at:", options: ["0°", "23.5°N", "23.5°S", "66.5°N"], answerIndex: 1, explanation: "It passes through the middle of India." },
        ],
        quizzes: [
          { slug: "quiz-india-climate", title: "Indian Climate & Map Skills", description: "Monsoon, scale and contours.", difficulty: "medium", timeLimitSec: 360, questions: [0, 1, 2, 3, 4] },
        ],
      },
    ],
  },

  /* ========================== COMPUTER SCIENCE ========================== */
  {
    slug: "computer-science",
    name: "Computer Science",
    tagline: "From algorithms and data to building the web",
    icon: "💻",
    color: "violet",
    chapters: [
      {
        slug: "cs-fundamentals",
        title: "Computing Fundamentals",
        summary: "Number systems, algorithms, flowcharts and complexity.",
        level: "beginner",
        minutes: 40,
        lessons: [
          {
            slug: "lesson-number-systems",
            title: "Number Systems and Binary",
            minutes: 9,
            blocks: [
              { kind: "paragraph", text: "Computers use the binary (base-2) system because a transistor has exactly two states: on and off." },
              { kind: "formula", text: "13 = 1101₂ = 8 + 4 + 0 + 1" },
              { kind: "list", items: ["Binary place values: 1, 2, 4, 8, 16, 32, 64, 128.", "1 bit = one binary digit; 1 byte = 8 bits = 256 possible values.", "Hexadecimal (base 16) uses 0–9 and A–F; one hex digit = exactly 4 bits.", "Text is stored as numbers using ASCII (128 characters) or Unicode (all world scripts)."] },
              { kind: "tip", text: "To convert decimal to binary, divide repeatedly by 2 and read the remainders upwards." },
            ],
          },
          {
            slug: "lesson-algorithms",
            title: "Algorithms, Flowcharts and Complexity",
            minutes: 10,
            blocks: [
              { kind: "paragraph", text: "An algorithm is a finite, definite and effective set of steps that solves a problem. It is drawn as a flowchart (oval = start/end, rectangle = process, diamond = decision, parallelogram = input/output) or written as pseudocode." },
              { kind: "list", items: ["Linear search checks every element — O(n).", "Binary search needs sorted data and halves the search each step — O(log n).", "Bubble/selection/insertion sort are O(n²); merge sort and quicksort are O(n log n)."] },
              { kind: "example", title: "Why binary search wins", text: "Searching 1000 pages: linear search may check all 1000; binary search needs about 10 steps." },
              { kind: "code", lang: "python", code: "def binary_search(arr, target):\n    lo, hi = 0, len(arr) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if arr[mid] == target:\n            return mid\n        if arr[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1" },
            ],
          },
        ],
        cards: [
          { front: "How many values can 8 bits store?", back: "256 (0 to 255).", hint: "2⁸." },
          { front: "What is binary search's time complexity?", back: "O(log n).", hint: "Requires sorted data." },
          { front: "Convert 13 to binary.", back: "1101.", hint: "8 + 4 + 1." },
          { front: "What does the diamond symbol mean in a flowchart?", back: "A decision point (yes/no branch).", hint: "Conditional." },
          { front: "Which sort is O(n log n)?", back: "Merge sort (and quicksort, on average).", hint: "Divide and conquer." },
          { front: "One hex digit equals how many bits?", back: "4.", hint: "16 = 2⁴." },
        ],
        questions: [
          { prompt: "One byte equals:", options: ["4 bits", "8 bits", "16 bits", "1024 bits"], answerIndex: 1, explanation: "A byte is 8 bits and stores 256 values." },
          { prompt: "Binary search requires the data to be:", options: ["Sorted", "Small", "Numeric", "Unique"], answerIndex: 0, explanation: "It halves the range, which only works on sorted data." },
          { prompt: "The time complexity of linear search is:", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], answerIndex: 2, explanation: "It may check every element once." },
          { prompt: "In a flowchart, a diamond represents:", options: ["Start", "Process", "Decision", "Input"], answerIndex: 2, explanation: "A yes/no branch point." },
          { prompt: "Convert 25 to binary.", options: ["11001", "10011", "11100", "10101"], answerIndex: 0, explanation: "25 = 16 + 8 + 1 = 11001." },
          { prompt: "Merge sort has complexity:", options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], answerIndex: 1, explanation: "Divide and conquer gives n log n." },
        ],
        quizzes: [
          { slug: "quiz-computing-fundamentals", title: "Computing Fundamentals", description: "Binary, algorithms and complexity.", difficulty: "medium", timeLimitSec: 360, questions: [0, 1, 2, 3, 4, 5] },
        ],
      },
      {
        slug: "cs-programming",
        title: "Programming and the Web",
        summary: "Programming fundamentals, HTML/CSS, databases and networking.",
        level: "intermediate",
        minutes: 60,
        lessons: [
          {
            slug: "lesson-programming-basics",
            title: "Programming Fundamentals",
            minutes: 12,
            blocks: [
              { kind: "paragraph", text: "The building blocks of every program: variables, data types, conditionals, loops and functions." },
              { kind: "code", lang: "python", code: "# Conditionals and loops\nfor i in range(1, 11):\n    if i % 3 == 0:\n        print(f\"{i} is divisible by 3\")\n\n# Functions (DRY - Don't Repeat Yourself)\ndef average(numbers):\n    return sum(numbers) / len(numbers)\n\nprint(average([10, 20, 30]))  # 20.0" },
              { kind: "list", items: ["Variables are named containers with a type (int, float, str, bool, list, dict).", "if/else makes decisions; for/while repeats work.", "Functions package reusable logic with inputs and a return value.", "Debugging: read the error, reproduce it, isolate it, fix it, test again."] },
              { kind: "tip", text: "The error message tells you the file, the line and the reason. Read it fully before changing anything." },
            ],
          },
          {
            slug: "lesson-html-css",
            title: "HTML and CSS",
            minutes: 11,
            blocks: [
              { kind: "paragraph", text: "HTML structures a page, CSS styles it, JavaScript adds behaviour. Use semantic tags for accessibility and SEO." },
              { kind: "code", lang: "html", code: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>My page</title>\n  <style>\n    body { font-family: system-ui, sans-serif; background: #05030f; color: #e9e4ff; }\n    .card { border-radius: 16px; padding: 20px; }\n    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }\n  </style>\n</head>\n<body>\n  <main class=\"card\">\n    <h1>Hello, HELIXEDU</h1>\n    <p>My first styled page.</p>\n  </main>\n</body>\n</html>" },
              { kind: "list", items: ["CSS rule = selector { property: value }.", "The box model: content → padding → border → margin. box-sizing: border-box makes width intuitive.", "Flexbox for one-dimensional layout, grid for two-dimensional.", "Media queries make a layout responsive to screen size."] },
            ],
          },
          {
            slug: "lesson-databases",
            title: "Databases and SQL",
            minutes: 11,
            blocks: [
              { kind: "paragraph", text: "A database stores data in tables of rows and typed columns. SQL is used to create, read, update and delete that data — the CRUD operations." },
              { kind: "code", lang: "sql", code: "CREATE TABLE students (\n  id SERIAL PRIMARY KEY,\n  name TEXT NOT NULL,\n  class TEXT,\n  score INTEGER\n);\n\nINSERT INTO students (name, class, score)\nVALUES ('Aarav', '10-A', 92);\n\nSELECT class, AVG(score) AS avg_score\nFROM students\nGROUP BY class\nHAVING AVG(score) > 70;" },
              { kind: "list", items: ["Primary key: uniquely identifies a row. Foreign key: references a row in another table.", "WHERE filters; ORDER BY sorts; GROUP BY aggregates; JOIN combines tables.", "Normalisation (1NF, 2NF, 3NF) reduces duplication.", "Indexes speed up reads but slow writes."] },
            ],
          },
          {
            slug: "lesson-networks-security",
            title: "Networks and Cyber Safety",
            minutes: 9,
            blocks: [
              { kind: "list", items: ["PAN < LAN < MAN < WAN — the internet is the largest WAN.", "Devices: modem, router, switch, hub, access point, firewall.", "Media: twisted pair, coaxial, optical fibre (fastest, uses light), wireless.", "Threats: malware, phishing, spoofing, denial-of-service, data breaches.", "Defences: strong unique passwords, two-factor authentication, encryption (HTTPS/TLS), updates, and not clicking unknown links."] },
              { kind: "tip", text: "Public Wi-Fi is convenient but risky. HTTPS plus a VPN protects your data on shared networks." },
            ],
          },
        ],
        cards: [
          { front: "What does SQL stand for?", back: "Structured Query Language.", hint: "Used to talk to relational databases." },
          { front: "What is a primary key?", back: "A column (or set) that uniquely identifies every row in a table.", hint: "No duplicates, no nulls." },
          { front: "HTML, CSS and JS — which is which?", back: "HTML = structure, CSS = style, JavaScript = behaviour.", hint: "Content, presentation, interaction." },
          { front: "What is phishing?", back: "A fraudulent message pretending to be trustworthy to steal credentials or data.", hint: "Check the sender and the link." },
          { front: "Fastest wired transmission medium?", back: "Optical fibre — it carries data as light.", hint: "Very high bandwidth." },
          { front: "Which CSS layout is two-dimensional?", back: "CSS Grid (flexbox is one-dimensional).", hint: "Rows and columns together." },
        ],
        questions: [
          { prompt: "SQL stands for:", options: ["Simple Query Language", "Structured Query Language", "Sequential Query Logic", "System Question Language"], answerIndex: 1, explanation: "Structured Query Language." },
          { prompt: "A primary key must be:", options: ["Unique and non-null", "The first column", "Numeric", "Indexed"], answerIndex: 0, explanation: "It uniquely identifies each row, so it cannot repeat or be empty." },
          { prompt: "CSS Grid is best described as:", options: ["One-dimensional layout", "Two-dimensional layout", "A colour model", "A database"], answerIndex: 1, explanation: "Grid controls rows and columns together." },
          { prompt: "The fastest wired transmission medium is:", options: ["Twisted pair", "Coaxial cable", "Optical fibre", "Radio"], answerIndex: 2, explanation: "Fibre carries data as light with very high bandwidth." },
          { prompt: "Two-factor authentication adds:", options: ["A second password", "A second proof of identity beyond the password", "An antivirus", "A firewall"], answerIndex: 1, explanation: "Something you have (phone/key) or are (biometric), plus something you know." },
          { prompt: "Which SQL clause filters rows?", options: ["ORDER BY", "GROUP BY", "WHERE", "JOIN"], answerIndex: 2, explanation: "WHERE filters rows before aggregation." },
        ],
        quizzes: [
          { slug: "quiz-programming-web", title: "Programming, Web & Data", description: "Programming, HTML/CSS, SQL and networks.", difficulty: "medium", timeLimitSec: 420, questions: [0, 1, 2, 3, 4, 5] },
        ],
      },
    ],
  },

  /* ============================== LANGUAGES ============================= */
  {
    slug: "languages",
    name: "Languages",
    tagline: "Open doors to other cultures and minds",
    icon: "🗣️",
    color: "cyan",
    chapters: [
      {
        slug: "lang-spanish",
        title: "Spanish for Beginners",
        summary: "Greetings, gender, the two verbs 'to be', and present-tense verbs.",
        level: "beginner",
        minutes: 35,
        lessons: [
          {
            slug: "lesson-spanish-basics",
            title: "First Words and Ser vs Estar",
            minutes: 10,
            blocks: [
              { kind: "heading", text: "Greetings" },
              { kind: "list", items: ["hola — hello", "buenos días — good morning", "buenas tardes — good afternoon", "buenas noches — good night", "adiós — goodbye; gracias — thank you"] },
              { kind: "heading", text: "The two verbs for 'to be'" },
              { kind: "list", items: ["ser — permanent qualities: soy alto (I am tall).", "estar — temporary states and location: estoy cansado (I am tired), estoy en casa (I am at home)."] },
              { kind: "heading", text: "Introducing yourself" },
              { kind: "list", items: ["¿Cómo te llamas? — What is your name?", "Me llamo… — My name is…", "Soy de la India — I am from India."] },
              { kind: "tip", text: "Spanish uses inverted punctuation ¿ and ¡ to open questions and exclamations." },
            ],
          },
          {
            slug: "lesson-spanish-verbs",
            title: "Regular Verbs in the Present Tense",
            minutes: 9,
            blocks: [
              { kind: "paragraph", text: "Spanish has three regular infinitive endings: -ar, -er and -ir. Drop the ending and add the personal ending." },
              { kind: "list", items: ["-ar (hablar): hablo, hablas, habla, hablamos, habláis, hablan", "-er (comer): como, comes, come, comemos, coméis, comen", "-ir (vivir): vivo, vives, vive, vivimos, vivís, viven"] },
              { kind: "heading", text: "Nouns and gender" },
              { kind: "list", items: ["Nouns ending in -o are usually masculine (el libro).", "Nouns ending in -a are usually feminine (la casa).", "Plurals add -s, or -es after a consonant."] },
              { kind: "example", title: "Full sentence", text: "Hola, me llamo Aarav. Soy de la India. Estudio español todos los días." },
            ],
          },
        ],
        cards: [
          { front: "How do you say 'good morning' in Spanish?", back: "Buenos días.", hint: "Literally 'good days'." },
          { front: "ser vs estar?", back: "ser = permanent qualities; estar = temporary states and location.", hint: "Soy alto vs estoy cansado." },
          { front: "Conjugate 'comer' for 'yo'.", back: "como.", hint: "-er verbs: drop -er, add -o." },
          { front: "Is 'libro' masculine or feminine?", back: "Masculine (el libro) — words ending in -o are usually masculine.", hint: "-o = masculine." },
          { front: "How do you ask someone's name in Spanish?", back: "¿Cómo te llamas?", hint: "Note the inverted question mark." },
        ],
        questions: [
          { prompt: "'Buenos días' means:", options: ["Good night", "Good morning", "Goodbye", "Good evening"], answerIndex: 1, explanation: "It is used until around midday." },
          { prompt: "Which verb expresses a permanent quality?", options: ["estar", "ser", "tener", "hay"], answerIndex: 1, explanation: "ser is for permanent characteristics." },
          { prompt: "'Yo como' means:", options: ["I ate", "I eat", "I am eating", "You eat"], answerIndex: 1, explanation: "Present tense of comer." },
          { prompt: "'La casa' — 'casa' is:", options: ["Masculine", "Feminine", "Neuter", "Plural"], answerIndex: 1, explanation: "It takes the feminine article 'la'." },
          { prompt: "The plural of 'el libro' is:", options: ["los libros", "las libras", "el libros", "los libro"], answerIndex: 0, explanation: "Add -s and use the masculine plural article." },
        ],
        quizzes: [
          { slug: "quiz-spanish-basics", title: "Spanish Basics", description: "Greetings, gender and present-tense verbs.", difficulty: "easy", timeLimitSec: 300, questions: [0, 1, 2, 3, 4] },
        ],
      },
      {
        slug: "lang-french",
        title: "French for Beginners",
        summary: "Greetings, articles, silent letters and your first verbs.",
        level: "beginner",
        minutes: 30,
        lessons: [
          {
            slug: "lesson-french-basics",
            title: "Greetings and Articles",
            minutes: 9,
            blocks: [
              { kind: "heading", text: "Greetings and politeness" },
              { kind: "list", items: ["bonjour — hello / good day", "bonsoir — good evening", "salut — hi and bye (informal)", "au revoir — goodbye", "merci — thank you; s'il vous plaît — please"] },
              { kind: "heading", text: "Articles" },
              { kind: "list", items: ["le — the (masculine), la — the (feminine), les — the (plural)", "un — a (masculine), une — a (feminine)"] },
              { kind: "heading", text: "Introducing yourself" },
              { kind: "list", items: ["Je m'appelle… — My name is…", "Comment t'appelles-tu ? — What is your name?", "Je suis de… — I am from…"] },
              { kind: "tip", text: "Many final letters are silent: 'parle' is pronounced 'parl'." },
            ],
          },
        ],
        cards: [
          { front: "How do you say 'thank you' in French?", back: "Merci.", hint: "Add 'beaucoup' for 'thank you very much'." },
          { front: "French for 'the' (masculine)?", back: "le.", hint: "la = feminine, les = plural." },
          { front: "How do you say your name in French?", back: "Je m'appelle…", hint: "Literally 'I call myself'." },
          { front: "Is the final -e in 'parle' pronounced?", back: "No — most final letters are silent.", hint: "Pronounced 'parl'." },
          { front: "'Une' is used with:", back: "Feminine singular nouns.", hint: "un = masculine, une = feminine." },
        ],
        questions: [
          { prompt: "'Merci' means:", options: ["Please", "Thank you", "Sorry", "Hello"], answerIndex: 1, explanation: "It is the standard way to say thank you." },
          { prompt: "The masculine article for 'the' is:", options: ["la", "le", "les", "une"], answerIndex: 1, explanation: "le is masculine singular; la is feminine." },
          { prompt: "'Je m'appelle Priya' means:", options: ["I am Priya", "My name is Priya", "I like Priya", "Goodbye Priya"], answerIndex: 1, explanation: "Literally 'I call myself Priya'." },
          { prompt: "In French, the final -e of 'parle' is:", options: ["Pronounced 'uh'", "Silent", "Pronounced 'eh'", "Optional"], answerIndex: 1, explanation: "Most final consonants and -e are silent." },
        ],
        quizzes: [
          { slug: "quiz-french-basics", title: "French Basics", description: "Greetings, articles and introductions.", difficulty: "easy", timeLimitSec: 300, questions: [0, 1, 2, 3] },
        ],
      },
    ],
  },

  /* ========================== GENERAL KNOWLEDGE ========================= */
  {
    slug: "general-knowledge",
    name: "General Knowledge",
    tagline: "Facts, places and people worth knowing",
    icon: "🌐",
    color: "amber",
    chapters: [
      {
        slug: "gk-india",
        title: "India: States, Capitals and Achievements",
        summary: "States and capitals, national symbols and notable Indians.",
        level: "beginner",
        minutes: 30,
        lessons: [
          {
            slug: "lesson-states-capitals",
            title: "States and Union Territories",
            minutes: 9,
            blocks: [
              { kind: "paragraph", text: "India has 28 states and 8 union territories. Each state has its own capital, and some capitals are shared." },
              { kind: "list", items: ["Maharashtra → Mumbai", "Karnataka → Bengaluru", "Tamil Nadu → Chennai", "West Bengal → Kolkata", "Rajasthan → Jaipur", "Uttar Pradesh → Lucknow", "Kerala → Thiruvananthapuram", "Gujarat → Gandhinagar"] },
              { kind: "tip", text: "Chandigarh is the capital of both Punjab and Haryana. New Delhi is the national capital." },
            ],
          },
          {
            slug: "lesson-indian-science",
            title: "Indian Scientists and Their Work",
            minutes: 8,
            blocks: [
              { kind: "list", items: ["C. V. Raman — the Raman effect; Nobel Prize in Physics, 1930.", "Homi J. Bhabha — father of the Indian nuclear programme.", "Vikram Sarabhai — father of the Indian space programme; helped found ISRO.", "A. P. J. Abdul Kalam — 'Missile Man of India', later President of India.", "Satyendra Nath Bose — work with Einstein on Bose–Einstein statistics.", "Jagadish Chandra Bose — pioneering work in plant physiology and radio science."] },
              { kind: "tip", text: "ISRO's Chandrayaan and Mangalyaan missions made India the first Asian nation to reach Mars orbit on its first attempt." },
            ],
          },
        ],
        cards: [
          { front: "Capital of Maharashtra?", back: "Mumbai.", hint: "Also India's financial capital." },
          { front: "Capital of Karnataka?", back: "Bengaluru.", hint: "India's IT hub." },
          { front: "Who won the 1930 Nobel Prize in Physics?", back: "C. V. Raman, for the Raman effect.", hint: "Scattering of light." },
          { front: "Who is called the Missile Man of India?", back: "A. P. J. Abdul Kalam.", hint: "He later became President." },
          { front: "How many states does India have?", back: "28 states (plus 8 union territories).", hint: "As of the current structure." },
        ],
        questions: [
          { prompt: "The capital of Maharashtra is:", options: ["Pune", "Nagpur", "Mumbai", "Nashik"], answerIndex: 2, explanation: "Mumbai is the capital and financial centre." },
          { prompt: "C. V. Raman won the Nobel Prize for:", options: ["Medicine", "Peace", "Physics", "Literature"], answerIndex: 2, explanation: "The 1930 Nobel Prize in Physics for the Raman effect." },
          { prompt: "Bengaluru is the capital of:", options: ["Kerala", "Tamil Nadu", "Karnataka", "Andhra Pradesh"], answerIndex: 2, explanation: "Karnataka's capital and India's technology hub." },
          { prompt: "'Missile Man of India' refers to:", options: ["Homi Bhabha", "Vikram Sarabhai", "A. P. J. Abdul Kalam", "C. V. Raman"], answerIndex: 2, explanation: "He led India's missile programme and later became President." },
        ],
        quizzes: [
          { slug: "quiz-india-gk", title: "India General Knowledge", description: "Capitals, symbols and scientists.", difficulty: "easy", timeLimitSec: 300, questions: [0, 1, 2, 3] },
        ],
      },
      {
        slug: "gk-world",
        title: "The World and Its Organisations",
        summary: "Inventions, international bodies and global facts.",
        level: "beginner",
        minutes: 30,
        lessons: [
          {
            slug: "lesson-inventions",
            title: "Inventors and Their Inventions",
            minutes: 9,
            blocks: [
              { kind: "list", items: ["Thomas Edison — the practical incandescent light bulb (1879) and the phonograph.", "Alexander Graham Bell — the telephone (1876).", "Wright brothers — the first powered aeroplane flight (1903).", "James Watt — the improved steam engine that powered the Industrial Revolution.", "Marie Curie — radium and polonium; Nobel Prizes in two sciences.", "Alexander Fleming — penicillin (1928).", "Tim Berners-Lee — the World Wide Web (1989).", "Alan Turing — the foundations of computer science."] },
              { kind: "tip", text: "Most 'inventions' are improvements: Edison built on decades of prior work, as Watt did before him." },
            ],
          },
          {
            slug: "lesson-un",
            title: "The United Nations and World Bodies",
            minutes: 8,
            blocks: [
              { kind: "paragraph", text: "The United Nations was founded on 24 October 1945 to keep international peace and security. Its headquarters is in New York." },
              { kind: "list", items: ["Six principal organs: General Assembly, Security Council, Secretariat, International Court of Justice, ECOSOC and the Trusteeship Council.", "The Security Council has 15 members — 5 permanent with veto power (China, France, Russia, UK, USA) and 10 elected for two years.", "Specialised agencies: WHO (health), UNESCO (education and culture), UNICEF (children), ILO (labour), FAO (food).", "The 17 Sustainable Development Goals were adopted in 2015 for achievement by 2030."] },
              { kind: "tip", text: "India is a founding member of the UN and one of its largest contributors of peacekeeping troops." },
            ],
          },
        ],
        cards: [
          { front: "Who invented the telephone?", back: "Alexander Graham Bell (1876).", hint: "Patented in the same year." },
          { front: "Who discovered penicillin?", back: "Alexander Fleming (1928).", hint: "A chance observation in a petri dish." },
          { front: "When was the United Nations founded?", back: "24 October 1945.", hint: "After the Second World War." },
          { front: "How many permanent Security Council members are there?", back: "Five, each with veto power.", hint: "China, France, Russia, UK, USA." },
          { front: "Who invented the World Wide Web?", back: "Tim Berners-Lee (1989).", hint: "Not the same as the internet." },
        ],
        questions: [
          { prompt: "The telephone was invented by:", options: ["Edison", "Bell", "Marconi", "Watt"], answerIndex: 1, explanation: "Alexander Graham Bell patented it in 1876." },
          { prompt: "Penicillin was discovered by:", options: ["Louis Pasteur", "Alexander Fleming", "Marie Curie", "Joseph Lister"], answerIndex: 1, explanation: "Fleming noticed the mould Penicillium killing bacteria in 1928." },
          { prompt: "The United Nations was founded in:", options: ["1919", "1939", "1945", "1950"], answerIndex: 2, explanation: "24 October 1945, replacing the League of Nations." },
          { prompt: "How many permanent members does the Security Council have?", options: ["3", "5", "10", "15"], answerIndex: 1, explanation: "Five permanent members with veto power, plus ten elected members." },
        ],
        quizzes: [
          { slug: "quiz-world-gk", title: "World General Knowledge", description: "Inventions and international organisations.", difficulty: "easy", timeLimitSec: 300, questions: [0, 1, 2, 3] },
        ],
      },
    ],
  },
];

export const ACHIEVEMENTS: { code: string; name: string; description: string; icon: string; tier: string }[] = [
  { code: "first-steps", name: "First Steps", description: "Complete your first lesson.", icon: "🌱", tier: "bronze" },
  { code: "curious-mind", name: "Curious Mind", description: "Ask the study assistant 10 questions.", icon: "🧠", tier: "bronze" },
  { code: "quiz-rookie", name: "Quiz Rookie", description: "Finish your first quiz.", icon: "📝", tier: "bronze" },
  { code: "sharp-shooter", name: "Sharp Shooter", description: "Score 100% in any quiz.", icon: "🎯", tier: "silver" },
  { code: "streak-3", name: "Warming Up", description: "Study 3 days in a row.", icon: "🔥", tier: "bronze" },
  { code: "streak-7", name: "Week Warrior", description: "Study 7 days in a row.", icon: "⚡", tier: "silver" },
  { code: "streak-30", name: "Unstoppable", description: "Study 30 days in a row.", icon: "🌟", tier: "gold" },
  { code: "flashcard-50", name: "Memory Builder", description: "Review 50 flashcards.", icon: "🃏", tier: "silver" },
  { code: "note-taker", name: "Note Taker", description: "Save 5 notes.", icon: "📒", tier: "bronze" },
  { code: "chapter-finisher", name: "Chapter Finisher", description: "Complete every lesson in a chapter.", icon: "📚", tier: "silver" },
  { code: "explorer", name: "Explorer", description: "Study in 3 different subjects.", icon: "🧭", tier: "silver" },
  { code: "scholar", name: "HELIX Scholar", description: "Complete 25 lessons.", icon: "👑", tier: "gold" },
];

