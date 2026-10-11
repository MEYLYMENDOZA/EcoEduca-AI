// Seed de datos - EcoEduca-AI (SRS v2, plataforma PRO)
// Siembra 1 Docente, 5 Alumnos con perfiles de accesibilidad diversos,
// 4 cursos MINEDU con 4 temas semanales cada uno (16 temas en total) y
// 6-8 quizzes por tema (con explicación pedagógica), matrículas, notas
// y caché de IA de ejemplo para demostrar el Eco-Prompting.
import { PrismaClient, AnswerOption } from "@prisma/client";
import bcrypt from "bcryptjs";
import { suggestAccessProfile } from "../src/controllers/teacher.controller";

const prisma = new PrismaClient();

interface QuizSeed {
  question: string;
  optionA: string;
  optionB: string;
  optionC?: string;
  correctOpt: AnswerOption;
  explanation: string;
}

interface TopicSeed {
  title: string;
  weekLabel: string;
  summaryText: string;
  quizzes: QuizSeed[];
}

interface CourseSeed {
  title: string;
  grade: string;
  topics: TopicSeed[];
}

const cursosData: CourseSeed[] = [
  {
    title: "Personal Social",
    grade: "5to Grado B - Primaria",
    topics: [
      {
        title: "Las 8 Regiones Naturales del Perú",
        weekLabel: "Semana 1",
        summaryText:
          "El Perú tiene 8 regiones naturales definidas por el geógrafo Javier Pulgar Vidal. Van desde la Costa a nivel del mar hasta la Puna y la Selva Baja. Cada región tiene un clima, flora y fauna propios. La Selva ocupa más del 60% del territorio nacional y concentra gran biodiversidad. La Sierra tiene los pisos más altos, donde vive la vicuña y crece la papa nativa. Conocer estas regiones ayuda a entender la diversidad geográfica y cultural del país.",
        quizzes: [
          { question: "¿Cuántas regiones naturales tiene el Perú según Pulgar Vidal?", optionA: "8", optionB: "3", optionC: "24", correctOpt: "A", explanation: "Javier Pulgar Vidal propuso 8 regiones naturales según altitud, clima y relieve, desde la Costa hasta la Selva Baja." },
          { question: "La región de la Selva se caracteriza por tener...", optionA: "Nieve todo el año", optionB: "Gran biodiversidad y bosques", correctOpt: "B", explanation: "La Selva concentra la mayor biodiversidad del Perú gracias a su clima cálido y húmedo, ideal para bosques tropicales." },
          { question: "¿Qué porcentaje aproximado del territorio peruano ocupa la Selva?", optionA: "Más del 60%", optionB: "Menos del 10%", optionC: "Exactamente el 50%", correctOpt: "A", explanation: "La Selva (Amazonía) es la región más extensa del Perú, cubriendo más del 60% del territorio nacional." },
          { question: "¿Qué animal es característico de la Sierra alta (Puna)?", optionA: "El delfín rosado", optionB: "La vicuña", correctOpt: "B", explanation: "La vicuña vive en las zonas altoandinas (Puna), adaptada al frío y la altura." },
          { question: "Las regiones naturales se definen principalmente por...", optionA: "El color de las banderas regionales", optionB: "La altitud, el clima y el relieve", correctOpt: "B", explanation: "Pulgar Vidal clasificó las regiones tomando en cuenta la altitud sobre el nivel del mar, el clima y las características del relieve." },
          { question: "¿Cuál de estas es una región costera?", optionA: "Chala", optionB: "Puna", optionC: "Rupa Rupa", correctOpt: "A", explanation: "Chala es el nombre de la región de Costa, ubicada entre el nivel del mar y los 500 msnm aproximadamente." },
          { question: "La papa nativa crece principalmente en...", optionA: "La Costa", optionB: "La Sierra", correctOpt: "B", explanation: "La Sierra peruana, con sus suelos andinos y clima frío, es el centro de origen y cultivo de la papa nativa." },
        ],
      },
      {
        title: "La Independencia del Perú",
        weekLabel: "Semana 2",
        summaryText:
          "La independencia del Perú se proclamó el 28 de julio de 1821 por José de San Martín en Lima. Antes de eso, hubo rebeliones importantes como la de Túpac Amaru II en 1780. San Martín llegó por mar con la Expedición Libertadora tras cruzar los Andes junto a otros países sudamericanos. Sin embargo, la independencia se consolidó recién en 1824 con las batallas de Junín y Ayacucho, lideradas por Simón Bolívar y Antonio José de Sucre. Estos hechos marcaron el fin del Virreinato del Perú.",
        quizzes: [
          { question: "¿En qué fecha se proclamó la independencia del Perú?", optionA: "28 de julio de 1821", optionB: "24 de junio de 1824", optionC: "9 de diciembre de 1824", correctOpt: "A", explanation: "José de San Martín proclamó la independencia del Perú en Lima el 28 de julio de 1821." },
          { question: "¿Quién proclamó la independencia del Perú?", optionA: "Simón Bolívar", optionB: "José de San Martín", correctOpt: "B", explanation: "San Martín, líder de la Expedición Libertadora, proclamó la independencia en la Plaza Mayor de Lima." },
          { question: "¿Qué batallas consolidaron definitivamente la independencia en 1824?", optionA: "Junín y Ayacucho", optionB: "Angamos y Arica", correctOpt: "A", explanation: "Las batallas de Junín y Ayacucho, en 1824, sellaron el fin del dominio español en Sudamérica." },
          { question: "¿Quién lideró la rebelión de 1780, antes de la independencia?", optionA: "Túpac Amaru II", optionB: "Antonio José de Sucre", correctOpt: "A", explanation: "Túpac Amaru II encabezó una de las rebeliones indígenas más importantes contra el dominio colonial en 1780." },
          { question: "¿Cómo llegó San Martín al Perú para iniciar la independencia?", optionA: "Cruzando la Amazonía", optionB: "Por mar, con la Expedición Libertadora", correctOpt: "B", explanation: "San Martín organizó la Expedición Libertadora, que llegó por mar a las costas del Perú en 1820." },
          { question: "¿Qué territorio dejó de existir tras la independencia?", optionA: "El Virreinato del Perú", optionB: "La República del Perú", correctOpt: "A", explanation: "El Virreinato del Perú fue la forma de gobierno colonial española que terminó con la independencia." },
          { question: "¿Quién comandó junto a Bolívar la batalla de Ayacucho?", optionA: "Antonio José de Sucre", optionB: "Francisco Pizarro", correctOpt: "A", explanation: "Antonio José de Sucre dirigió militarmente la batalla de Ayacucho en 1824." },
          { question: "La independencia del Perú fue un proceso...", optionA: "Instantáneo, en un solo día", optionB: "Largo, con varias etapas y batallas", correctOpt: "B", explanation: "Desde las rebeliones de 1780 hasta Ayacucho en 1824, el proceso duró más de 40 años." },
        ],
      },
      {
        title: "Los Símbolos Patrios y la Identidad Nacional",
        weekLabel: "Semana 3",
        summaryText:
          "Los símbolos patrios del Perú son la Bandera, el Escudo Nacional y el Himno Nacional. La bandera tiene los colores rojo y blanco, adoptados oficialmente en 1825. El Escudo Nacional está dividido en tres partes: la vicuña (fauna), el árbol de la quina (flora) y una cornucopia con monedas (riqueza mineral). El Himno Nacional fue compuesto por José Bernardo Alcedo con letra de José de la Torre Ugarte. Estos símbolos representan la identidad y la historia compartida de todos los peruanos.",
        quizzes: [
          { question: "¿Cuáles son los símbolos patrios del Perú?", optionA: "Bandera, Escudo e Himno Nacional", optionB: "Solo la Bandera", correctOpt: "A", explanation: "Los tres símbolos patrios oficiales son la Bandera, el Escudo Nacional y el Himno Nacional." },
          { question: "¿Qué colores tiene la bandera peruana?", optionA: "Rojo y blanco", optionB: "Verde y blanco", correctOpt: "A", explanation: "La bandera del Perú tiene franjas rojas y blancas, adoptadas oficialmente en 1825." },
          { question: "¿Qué animal aparece en el Escudo Nacional?", optionA: "El cóndor", optionB: "La vicuña", correctOpt: "B", explanation: "La vicuña representa la fauna nacional en uno de los tres cuadrantes del Escudo." },
          { question: "¿Qué representa el árbol de la quina en el Escudo?", optionA: "La flora nacional", optionB: "La minería", correctOpt: "A", explanation: "El árbol de la quina simboliza la riqueza vegetal (flora) del Perú." },
          { question: "¿Quién compuso la música del Himno Nacional del Perú?", optionA: "José Bernardo Alcedo", optionB: "José de la Torre Ugarte", correctOpt: "A", explanation: "José Bernardo Alcedo compuso la música; José de la Torre Ugarte escribió la letra." },
          { question: "La cornucopia del Escudo Nacional representa...", optionA: "La riqueza mineral", optionB: "La independencia", correctOpt: "A", explanation: "La cornucopia con monedas simboliza la abundancia y riqueza mineral del país." },
          { question: "¿Por qué son importantes los símbolos patrios?", optionA: "Porque representan la identidad y la historia del país", optionB: "Porque son solo decorativos", correctOpt: "A", explanation: "Los símbolos patrios unen a los ciudadanos alrededor de una historia e identidad compartidas." },
        ],
      },
      {
        title: "El Estado Peruano y sus Poderes",
        weekLabel: "Semana 4",
        summaryText:
          "El Estado peruano se organiza en tres poderes: el Poder Ejecutivo (dirigido por el Presidente de la República), el Poder Legislativo (el Congreso, que hace las leyes) y el Poder Judicial (que administra justicia). Esta división busca que ningún poder se concentre en una sola persona o institución. Además, existen organismos autónomos como la ONPE y el JNE que se encargan de los procesos electorales. El Perú es una república democrática donde los ciudadanos eligen a sus autoridades mediante el voto.",
        quizzes: [
          { question: "¿Cuáles son los tres poderes del Estado peruano?", optionA: "Ejecutivo, Legislativo y Judicial", optionB: "Militar, Policial y Civil", correctOpt: "A", explanation: "El Estado peruano se organiza en Poder Ejecutivo, Legislativo y Judicial, siguiendo el principio de separación de poderes." },
          { question: "¿Quién dirige el Poder Ejecutivo?", optionA: "El Presidente de la República", optionB: "El Congreso", correctOpt: "A", explanation: "El Poder Ejecutivo está encabezado por el Presidente de la República." },
          { question: "¿Qué función tiene el Poder Legislativo (Congreso)?", optionA: "Hacer las leyes", optionB: "Juzgar a los ciudadanos", correctOpt: "A", explanation: "El Congreso, como Poder Legislativo, tiene la función principal de elaborar y aprobar las leyes." },
          { question: "¿Qué poder del Estado administra justicia?", optionA: "El Poder Judicial", optionB: "El Poder Ejecutivo", correctOpt: "A", explanation: "El Poder Judicial se encarga de administrar justicia y resolver conflictos legales." },
          { question: "¿Por qué el Estado se divide en tres poderes?", optionA: "Para que ninguno concentre demasiado poder", optionB: "Para ahorrar dinero", correctOpt: "A", explanation: "La separación de poderes evita que una sola institución concentre demasiado control, protegiendo la democracia." },
          { question: "¿Qué organismo se encarga de organizar las elecciones en el Perú?", optionA: "La ONPE", optionB: "El Poder Judicial", correctOpt: "A", explanation: "La ONPE (Oficina Nacional de Procesos Electorales) organiza y ejecuta los procesos electorales en el país." },
          { question: "El Perú es una república...", optionA: "Democrática, con autoridades elegidas por voto", optionB: "Monárquica, con un rey", correctOpt: "A", explanation: "El Perú es una república democrática donde los ciudadanos eligen a sus autoridades mediante el voto." },
        ],
      },
    ],
  },
  {
    title: "Comunicación",
    grade: "5to Grado B - Primaria",
    topics: [
      {
        title: "Comprensión Lectora y Producción de Textos",
        weekLabel: "Semana 1",
        summaryText:
          "Un sustantivo nombra personas, animales, cosas o ideas. Una oración necesita un sujeto y un predicado para tener sentido completo. Leer con atención permite identificar la idea principal de un texto. Practicar la escritura ayuda a organizar mejor nuestras ideas. Los adjetivos describen las características de los sustantivos, como el color o el tamaño. Un párrafo bien escrito desarrolla una sola idea principal con oraciones que la explican.",
        quizzes: [
          { question: "¿Cuál de estas palabras es un sustantivo?", optionA: "Correr", optionB: "Casa", optionC: "Rápido", correctOpt: "B", explanation: "\"Casa\" nombra una cosa, por lo tanto es un sustantivo. \"Correr\" es un verbo y \"rápido\" un adverbio/adjetivo." },
          { question: "Una oración siempre debe tener sujeto y...", optionA: "Predicado", optionB: "Color", correctOpt: "A", explanation: "Toda oración completa necesita un sujeto (de quién se habla) y un predicado (qué se dice de él)." },
          { question: "¿Qué función cumple un adjetivo?", optionA: "Describir características del sustantivo", optionB: "Reemplazar al verbo", correctOpt: "A", explanation: "Los adjetivos describen cualidades como el color, tamaño o forma de un sustantivo, por ejemplo: 'casa grande'." },
          { question: "¿Qué debe desarrollar un buen párrafo?", optionA: "Una sola idea principal", optionB: "Muchas ideas sin relación", correctOpt: "A", explanation: "Un párrafo bien construido se organiza alrededor de una única idea principal, apoyada por oraciones secundarias." },
          { question: "Leer con atención nos ayuda a identificar...", optionA: "La idea principal del texto", optionB: "El número de páginas", correctOpt: "A", explanation: "La lectura atenta permite reconocer qué es lo más importante que el autor quiere comunicar." },
          { question: "¿Cuál de estas es una oración completa?", optionA: "El perro ladra fuerte.", optionB: "Ladra fuerte muy.", correctOpt: "A", explanation: "\"El perro ladra fuerte\" tiene sujeto (el perro) y predicado (ladra fuerte), formando una oración con sentido completo." },
          { question: "Practicar la escritura sirve principalmente para...", optionA: "Organizar mejor nuestras ideas", optionB: "Memorizar números", correctOpt: "A", explanation: "Escribir con frecuencia ayuda a estructurar el pensamiento y comunicar ideas con mayor claridad." },
        ],
      },
      {
        title: "Los Signos de Puntuación",
        weekLabel: "Semana 2",
        summaryText:
          "Los signos de puntuación ayudan a dar sentido y ritmo a la lectura. El punto (.) indica el final de una oración. La coma (,) separa elementos de una lista o ideas dentro de una oración. Los signos de interrogación (¿?) se usan para preguntas y los de exclamación (¡!) para expresar emociones fuertes. Usar bien los signos evita confusiones al leer un texto en voz alta.",
        quizzes: [
          { question: "¿Para qué sirve el punto (.)?", optionA: "Para indicar el final de una oración", optionB: "Para hacer una pregunta", correctOpt: "A", explanation: "El punto marca el final de una oración o idea completa." },
          { question: "¿Qué signo se usa para hacer una pregunta en español?", optionA: "¿ ?", optionB: "¡ !", correctOpt: "A", explanation: "En español usamos los signos de interrogación de apertura y cierre: ¿ ?" },
          { question: "La coma (,) se utiliza principalmente para...", optionA: "Separar elementos de una lista", optionB: "Terminar un texto completo", correctOpt: "A", explanation: "La coma separa palabras o frases dentro de una enumeración o idea, por ejemplo: 'manzanas, peras y uvas'." },
          { question: "¿Qué signos se usan para expresar sorpresa o emoción fuerte?", optionA: "Signos de exclamación ¡ !", optionB: "Puntos suspensivos", correctOpt: "A", explanation: "Los signos de exclamación ¡ ! expresan emociones como sorpresa, alegría o enojo." },
          { question: "¿Por qué es importante usar bien los signos de puntuación?", optionA: "Porque evitan confusiones al leer", optionB: "Porque hacen el texto más largo", correctOpt: "A", explanation: "Una buena puntuación ayuda al lector a entender el ritmo y el sentido exacto de las ideas." },
          { question: "En español, los signos de interrogación y exclamación se escriben...", optionA: "Al inicio y al final de la pregunta/exclamación", optionB: "Solo al final", correctOpt: "A", explanation: "A diferencia del inglés, en español se usan signos de apertura (¿ ¡) y de cierre (? !)." },
        ],
      },
      {
        title: "El Cuento y sus Elementos",
        weekLabel: "Semana 3",
        summaryText:
          "Un cuento es una narración breve de hechos, reales o imaginarios, con pocos personajes. Sus elementos principales son: los personajes (quiénes participan), el escenario (dónde ocurre), y la trama (inicio, nudo y desenlace). El narrador es quien cuenta la historia y puede hablar en primera o tercera persona. Los cuentos suelen dejar una enseñanza o moraleja al final.",
        quizzes: [
          { question: "¿Qué es un cuento?", optionA: "Una narración breve con pocos personajes", optionB: "Un poema muy largo", correctOpt: "A", explanation: "El cuento es un relato corto, de ficción o basado en hechos, con un número reducido de personajes." },
          { question: "¿Cuáles son las tres partes de la trama de un cuento?", optionA: "Inicio, nudo y desenlace", optionB: "Título, autor y editorial", correctOpt: "A", explanation: "Toda trama narrativa se organiza en inicio (presentación), nudo (conflicto) y desenlace (resolución)." },
          { question: "¿Quién es el narrador de un cuento?", optionA: "Quien cuenta la historia", optionB: "El personaje principal siempre", correctOpt: "A", explanation: "El narrador es la voz que relata los hechos; puede o no ser uno de los personajes." },
          { question: "El escenario de un cuento se refiere a...", optionA: "El lugar donde ocurre la historia", optionB: "El nombre del autor", correctOpt: "A", explanation: "El escenario es el espacio y tiempo en el que se desarrollan los hechos narrados." },
          { question: "¿Qué suelen dejar los cuentos al final?", optionA: "Una enseñanza o moraleja", optionB: "Una lista de precios", correctOpt: "A", explanation: "Muchos cuentos, especialmente los tradicionales, terminan con una enseñanza para el lector." },
          { question: "Cuando el narrador participa en la historia y dice \"yo\", habla en...", optionA: "Primera persona", optionB: "Tercera persona", correctOpt: "A", explanation: "El narrador en primera persona participa en la historia y usa 'yo'; en tercera persona, cuenta desde fuera usando 'él/ella'." },
        ],
      },
      {
        title: "La Comunicación Oral y la Exposición",
        weekLabel: "Semana 4",
        summaryText:
          "La comunicación oral es el intercambio de ideas mediante la voz. Al exponer un tema, es importante organizar las ideas antes de hablar, mirar al público y hablar con un volumen claro. Usar imágenes o esquemas de apoyo ayuda a que el público comprenda mejor. Escuchar con atención a los demás también es parte fundamental de una buena comunicación.",
        quizzes: [
          { question: "¿Qué es la comunicación oral?", optionA: "El intercambio de ideas mediante la voz", optionB: "Escribir cartas", correctOpt: "A", explanation: "La comunicación oral usa la voz y el habla para transmitir ideas entre las personas." },
          { question: "Antes de exponer un tema, es importante...", optionA: "Organizar las ideas", optionB: "Improvisar sin preparación", correctOpt: "A", explanation: "Organizar las ideas previamente ayuda a que la exposición sea clara y ordenada." },
          { question: "¿Qué se recomienda hacer mientras se expone frente al público?", optionA: "Mirar al público y hablar con volumen claro", optionB: "Mirar solo el piso y hablar en voz baja", correctOpt: "A", explanation: "Mirar al público y proyectar bien la voz ayuda a mantener la atención y a comunicarse con claridad." },
          { question: "¿Para qué sirven las imágenes o esquemas de apoyo en una exposición?", optionA: "Para ayudar al público a comprender mejor", optionB: "Para hacer perder el tiempo", correctOpt: "A", explanation: "Los recursos visuales refuerzan las ideas habladas y facilitan la comprensión del público." },
          { question: "Escuchar con atención a los demás es...", optionA: "Parte fundamental de la buena comunicación", optionB: "Innecesario si uno ya habló", correctOpt: "A", explanation: "La comunicación es de dos vías: hablar y escuchar son igual de importantes para entenderse." },
        ],
      },
    ],
  },
  {
    title: "Razonamiento Matemático",
    grade: "5to Grado B - Primaria",
    topics: [
      {
        title: "Operaciones con Números Naturales",
        weekLabel: "Semana 1",
        summaryText:
          "La suma combina cantidades para obtener un total. La resta encuentra la diferencia entre dos cantidades. La multiplicación es una suma repetida de un mismo número. La división reparte una cantidad en partes iguales. Practicar operaciones básicas todos los días mejora la agilidad mental. Es útil verificar los resultados contando con los dedos o dibujando grupos.",
        quizzes: [
          { question: "¿Cuánto es 8 + 5?", optionA: "12", optionB: "13", optionC: "14", correctOpt: "B", explanation: "8 + 5 = 13. Puedes verificarlo contando 5 unidades más a partir de 8." },
          { question: "¿Cuánto es 6 x 3?", optionA: "16", optionB: "9", optionC: "18", correctOpt: "C", explanation: "6 x 3 equivale a sumar 6 tres veces: 6+6+6 = 18." },
          { question: "¿Cuánto es 20 - 7?", optionA: "13", optionB: "12", optionC: "15", correctOpt: "A", explanation: "20 - 7 = 13. La resta busca la diferencia entre 20 y 7." },
          { question: "¿Cuánto es 15 ÷ 3?", optionA: "5", optionB: "6", optionC: "3", correctOpt: "A", explanation: "15 ÷ 3 = 5, porque 5 grupos de 3 suman 15." },
          { question: "La multiplicación es una forma abreviada de...", optionA: "Una suma repetida", optionB: "Una resta repetida", correctOpt: "A", explanation: "Multiplicar un número varias veces equivale a sumarlo repetidamente esa cantidad de veces." },
          { question: "¿Cuánto es 9 + 9 + 9 (usando multiplicación)?", optionA: "9 x 3 = 27", optionB: "9 x 2 = 18", correctOpt: "A", explanation: "Sumar 9 tres veces es lo mismo que multiplicar 9 x 3, que da 27." },
          { question: "¿Cuál es una forma útil de verificar un resultado?", optionA: "Contar con los dedos o dibujar grupos", optionB: "Adivinar sin comprobar", correctOpt: "A", explanation: "Usar apoyos visuales como dibujos o los dedos ayuda a confirmar que el resultado de una operación es correcto." },
        ],
      },
      {
        title: "Fracciones y su Uso Cotidiano",
        weekLabel: "Semana 2",
        summaryText:
          "Una fracción representa una parte de un todo, como 1/2 (una mitad) o 1/4 (un cuarto). El número de arriba se llama numerador y el de abajo denominador. Las fracciones se usan al repartir una pizza, medir ingredientes en una receta o dividir el tiempo. Dos fracciones son equivalentes cuando representan la misma cantidad, aunque se escriban distinto, como 1/2 y 2/4.",
        quizzes: [
          { question: "¿Qué representa la fracción 1/2?", optionA: "Una mitad de un todo", optionB: "El doble de un todo", correctOpt: "A", explanation: "1/2 significa dividir algo en 2 partes iguales y tomar 1 de ellas: una mitad." },
          { question: "En la fracción 3/4, ¿cómo se llama el número 4?", optionA: "Denominador", optionB: "Numerador", correctOpt: "A", explanation: "El denominador (número de abajo) indica en cuántas partes iguales se divide el todo." },
          { question: "¿Cuál de estas fracciones es equivalente a 1/2?", optionA: "2/4", optionB: "1/4", correctOpt: "A", explanation: "2/4 se simplifica a 1/2, por lo tanto representan la misma cantidad." },
          { question: "Si divides una pizza en 4 partes iguales y comes 1, ¿qué fracción comiste?", optionA: "1/4", optionB: "4/1", correctOpt: "A", explanation: "Comiste 1 de las 4 partes iguales, es decir, 1/4 de la pizza." },
          { question: "El numerador de una fracción indica...", optionA: "Cuántas partes se toman del todo", optionB: "En cuántas partes se divide el todo", correctOpt: "A", explanation: "El numerador (número de arriba) indica cuántas de esas partes iguales estamos tomando." },
          { question: "¿En qué situación cotidiana usamos fracciones?", optionA: "Al medir ingredientes de una receta", optionB: "Al contar animales enteros", correctOpt: "A", explanation: "Las recetas suelen pedir medidas como 1/2 taza o 1/4 de cucharadita, usando fracciones." },
        ],
      },
      {
        title: "Geometría: Perímetro y Área",
        weekLabel: "Semana 3",
        summaryText:
          "El perímetro es la suma de todos los lados de una figura, es decir, la longitud de su contorno. El área mide la superficie que ocupa una figura, expresada en unidades cuadradas. Para un rectángulo, el perímetro se calcula sumando dos veces el largo más dos veces el ancho, y el área se calcula multiplicando el largo por el ancho. Estos conceptos se usan al medir terrenos, habitaciones o jardines.",
        quizzes: [
          { question: "¿Qué mide el perímetro de una figura?", optionA: "La longitud de su contorno", optionB: "La cantidad de esquinas", correctOpt: "A", explanation: "El perímetro es la suma de las longitudes de todos los lados, es decir, el contorno completo de la figura." },
          { question: "¿Qué mide el área de una figura?", optionA: "La superficie que ocupa", optionB: "El número de lados", correctOpt: "A", explanation: "El área representa cuánto espacio (superficie) cubre una figura, medida en unidades cuadradas." },
          { question: "Un rectángulo mide 5 cm de largo y 3 cm de ancho. ¿Cuál es su área?", optionA: "15 cm²", optionB: "8 cm²", optionC: "16 cm²", correctOpt: "A", explanation: "El área del rectángulo es largo x ancho = 5 x 3 = 15 cm²." },
          { question: "Ese mismo rectángulo (5 cm x 3 cm), ¿cuál es su perímetro?", optionA: "16 cm", optionB: "15 cm", optionC: "8 cm", correctOpt: "A", explanation: "El perímetro es 2 x (largo + ancho) = 2 x (5+3) = 2 x 8 = 16 cm." },
          { question: "¿En qué unidades se mide siempre el área?", optionA: "Unidades cuadradas (cm², m², etc.)", optionB: "Unidades simples (cm, m)", correctOpt: "A", explanation: "El área siempre se expresa en unidades al cuadrado porque mide una superficie de dos dimensiones." },
          { question: "¿Para qué situación real se usa el cálculo de área?", optionA: "Para saber cuánta pintura se necesita para una pared", optionB: "Para saber la hora del día", correctOpt: "A", explanation: "Calcular el área de una pared permite estimar cuánta pintura u otro material se necesitará para cubrirla." },
        ],
      },
      {
        title: "Problemas de Lógica y Razonamiento",
        weekLabel: "Semana 4",
        summaryText:
          "Los problemas de lógica requieren leer con atención, identificar los datos importantes y pensar antes de responder. Una estrategia útil es hacer un dibujo o esquema para representar la situación. Las secuencias numéricas siguen un patrón que se repite o cambia de forma constante, como sumar siempre el mismo número. Resolver problemas paso a paso, sin apresurarse, ayuda a evitar errores.",
        quizzes: [
          { question: "¿Qué número sigue en la secuencia 2, 4, 6, 8, __?", optionA: "9", optionB: "10", optionC: "12", correctOpt: "B", explanation: "La secuencia suma 2 en cada paso: 2,4,6,8,10. El patrón es +2." },
          { question: "¿Qué número sigue en la secuencia 5, 10, 15, 20, __?", optionA: "25", optionB: "22", correctOpt: "A", explanation: "La secuencia suma 5 en cada paso, así que después de 20 sigue 25." },
          { question: "Una buena estrategia para resolver un problema de lógica es...", optionA: "Hacer un dibujo o esquema de la situación", optionB: "Responder lo primero que se piense sin analizar", correctOpt: "A", explanation: "Representar visualmente el problema (dibujo o esquema) ayuda a comprenderlo mejor antes de resolverlo." },
          { question: "Si Ana tiene 3 manzanas más que Luis, y Luis tiene 4, ¿cuántas tiene Ana?", optionA: "7", optionB: "1", optionC: "12", correctOpt: "A", explanation: "Ana tiene 3 más que Luis (4), entonces Ana tiene 4 + 3 = 7 manzanas." },
          { question: "Antes de responder un problema, es importante...", optionA: "Leer con atención e identificar los datos", optionB: "Responder rápido sin leer todo", correctOpt: "A", explanation: "Leer con calma e identificar qué datos son importantes evita errores comunes al resolver problemas." },
          { question: "¿Qué es un patrón en una secuencia numérica?", optionA: "Una regla que se repite o cambia de forma constante", optionB: "Un número elegido al azar", correctOpt: "A", explanation: "Un patrón es la regla constante (como sumar siempre 2) que permite predecir el siguiente número de la secuencia." },
        ],
      },
    ],
  },
  {
    title: "Ciencia y Tecnología",
    grade: "5to Grado B - Primaria",
    topics: [
      {
        title: "Los Seres Vivos y su Ecosistema",
        weekLabel: "Semana 1",
        summaryText:
          "Las plantas necesitan luz solar, agua y dióxido de carbono para hacer la fotosíntesis. Este proceso produce el oxígeno que respiramos. Los ecosistemas equilibran a productores (plantas), consumidores (animales) y descomponedores (hongos y bacterias). Cuidar el ambiente ayuda a mantener este equilibrio natural. Una cadena alimenticia muestra cómo la energía pasa de un ser vivo a otro.",
        quizzes: [
          { question: "¿Qué necesitan las plantas para hacer la fotosíntesis?", optionA: "Luz solar", optionB: "Oscuridad total", correctOpt: "A", explanation: "La fotosíntesis requiere luz solar, agua y dióxido de carbono para producir energía y oxígeno." },
          { question: "¿Qué gas producen las plantas durante la fotosíntesis?", optionA: "Oxígeno", optionB: "Dióxido de carbono únicamente", correctOpt: "A", explanation: "Como resultado de la fotosíntesis, las plantas liberan oxígeno, esencial para la respiración de los seres vivos." },
          { question: "En un ecosistema, ¿quiénes son los 'productores'?", optionA: "Las plantas", optionB: "Los animales carnívoros", correctOpt: "A", explanation: "Las plantas son productoras porque generan su propio alimento mediante la fotosíntesis." },
          { question: "¿Qué función cumplen los descomponedores (hongos y bacterias)?", optionA: "Descomponer materia orgánica muerta", optionB: "Producir su propio alimento con luz solar", correctOpt: "A", explanation: "Los descomponedores transforman restos de seres vivos en nutrientes que vuelven al suelo." },
          { question: "¿Qué muestra una cadena alimenticia?", optionA: "Cómo pasa la energía de un ser vivo a otro", optionB: "El clima de una región", correctOpt: "A", explanation: "La cadena alimenticia representa quién se alimenta de quién, mostrando el flujo de energía en el ecosistema." },
          { question: "¿Por qué es importante cuidar el ambiente?", optionA: "Para mantener el equilibrio natural de los ecosistemas", optionB: "Porque no tiene ninguna consecuencia", correctOpt: "A", explanation: "Cuidar el ambiente evita romper el equilibrio entre productores, consumidores y descomponedores." },
        ],
      },
      {
        title: "El Sistema Solar y sus Planetas",
        weekLabel: "Semana 2",
        summaryText:
          "El Sistema Solar está formado por el Sol y todo lo que gira a su alrededor: 8 planetas, satélites, asteroides y cometas. Los planetas en orden desde el Sol son: Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano y Neptuno. La Tierra es el único planeta conocido con vida, gracias a su distancia adecuada del Sol y la presencia de agua líquida. Júpiter es el planeta más grande del Sistema Solar.",
        quizzes: [
          { question: "¿Cuántos planetas tiene el Sistema Solar?", optionA: "8", optionB: "9", optionC: "10", correctOpt: "A", explanation: "Actualmente se reconocen 8 planetas, desde que Plutón fue reclasificado como planeta enano en 2006." },
          { question: "¿Cuál es el planeta más cercano al Sol?", optionA: "Mercurio", optionB: "Venus", correctOpt: "A", explanation: "Mercurio es el planeta más cercano al Sol, seguido de Venus." },
          { question: "¿Cuál es el único planeta conocido con vida?", optionA: "La Tierra", optionB: "Marte", correctOpt: "A", explanation: "La Tierra tiene las condiciones adecuadas (distancia al Sol, agua líquida, atmósfera) para sostener vida." },
          { question: "¿Cuál es el planeta más grande del Sistema Solar?", optionA: "Júpiter", optionB: "Saturno", correctOpt: "A", explanation: "Júpiter es el planeta más grande, tan grande que podrían caber más de 1000 Tierras dentro de él." },
          { question: "¿Qué otros objetos forman parte del Sistema Solar, además de los planetas?", optionA: "Satélites, asteroides y cometas", optionB: "Solo estrellas lejanas", correctOpt: "A", explanation: "El Sistema Solar incluye también satélites naturales, asteroides y cometas que orbitan al Sol." },
          { question: "¿Qué planeta se conoce por sus anillos visibles?", optionA: "Saturno", optionB: "Marte", correctOpt: "A", explanation: "Saturno es famoso por su sistema de anillos formados por hielo y roca." },
          { question: "¿Por qué la Tierra puede sostener vida y otros planetas no?", optionA: "Por su distancia adecuada al Sol y presencia de agua líquida", optionB: "Porque es el planeta más grande", correctOpt: "A", explanation: "La combinación de temperatura adecuada, atmósfera y agua líquida hace posible la vida en la Tierra." },
        ],
      },
      {
        title: "Los Estados de la Materia",
        weekLabel: "Semana 3",
        summaryText:
          "La materia puede presentarse en tres estados principales: sólido, líquido y gaseoso. En el estado sólido, las partículas están muy unidas y mantienen una forma fija, como el hielo. En el estado líquido, las partículas se mueven con más libertad y toman la forma del recipiente, como el agua. En el estado gaseoso, las partículas se mueven libremente y ocupan todo el espacio disponible, como el vapor. Un cambio de estado ocurre cuando se aplica o se quita calor, como cuando el hielo se derrite o el agua hierve.",
        quizzes: [
          { question: "¿Cuáles son los tres estados principales de la materia?", optionA: "Sólido, líquido y gaseoso", optionB: "Caliente, frío y templado", correctOpt: "A", explanation: "La materia se presenta comúnmente en estado sólido, líquido o gaseoso, según cómo se mueven sus partículas." },
          { question: "¿Qué característica tiene el estado sólido?", optionA: "Mantiene una forma fija", optionB: "Toma la forma del recipiente", correctOpt: "A", explanation: "En un sólido, las partículas están muy unidas y no se mueven libremente, por lo que conserva su forma." },
          { question: "¿Qué ocurre cuando el hielo se derrite?", optionA: "Pasa de sólido a líquido", optionB: "Pasa de líquido a gaseoso", correctOpt: "A", explanation: "Al recibir calor, el hielo (sólido) se derrite y se convierte en agua (líquido)." },
          { question: "¿Qué pasa cuando el agua hierve?", optionA: "Pasa de líquido a gaseoso (vapor)", optionB: "Pasa de gaseoso a sólido", correctOpt: "A", explanation: "Al aplicar suficiente calor, el agua líquida se transforma en vapor, que es su estado gaseoso." },
          { question: "En el estado gaseoso, las partículas...", optionA: "Se mueven libremente y ocupan todo el espacio disponible", optionB: "Están completamente inmóviles", correctOpt: "A", explanation: "En un gas, las partículas tienen mucha libertad de movimiento y se expanden para llenar el espacio disponible." },
          { question: "¿Qué provoca un cambio de estado en la materia?", optionA: "Aplicar o quitar calor", optionB: "Cambiar el color del objeto", correctOpt: "A", explanation: "Los cambios de estado (fusión, evaporación, congelación) ocurren al modificar la temperatura de la materia." },
        ],
      },
      {
        title: "El Cuidado del Medio Ambiente y el Reciclaje",
        weekLabel: "Semana 4",
        summaryText:
          "El reciclaje es el proceso de transformar materiales usados en nuevos productos, reduciendo la basura y el uso de recursos naturales. Los materiales se separan en categorías como papel, plástico, vidrio y orgánicos, cada uno con un contenedor de color distinto. Reducir el consumo, reutilizar objetos y reciclar (las 3R) son acciones que ayudan a cuidar el planeta. Ahorrar energía, como apagar luces innecesarias, también contribuye al cuidado ambiental.",
        quizzes: [
          { question: "¿Qué es el reciclaje?", optionA: "Transformar materiales usados en nuevos productos", optionB: "Quemar toda la basura", correctOpt: "A", explanation: "Reciclar significa dar una nueva vida útil a materiales que ya se usaron, evitando que se conviertan en desecho." },
          { question: "¿Cuáles son las \"3R\" del cuidado ambiental?", optionA: "Reducir, Reutilizar y Reciclar", optionB: "Romper, Reemplazar y Rehacer", correctOpt: "A", explanation: "Las 3R son un conjunto de acciones: reducir el consumo, reutilizar objetos y reciclar materiales." },
          { question: "¿Por qué se separan los materiales por colores de contenedor?", optionA: "Para facilitar su clasificación y reciclaje", optionB: "Solo por decoración", correctOpt: "A", explanation: "Separar por tipo de material (papel, plástico, vidrio, orgánico) facilita su procesamiento posterior en las plantas de reciclaje." },
          { question: "¿Cuál de estas es una acción de ahorro de energía?", optionA: "Apagar las luces que no se usan", optionB: "Dejar todos los aparatos encendidos siempre", correctOpt: "A", explanation: "Apagar luces y aparatos innecesarios reduce el consumo de energía y ayuda al medio ambiente." },
          { question: "Reutilizar un objeto significa...", optionA: "Darle un nuevo uso antes de desecharlo", optionB: "Tirarlo inmediatamente después de usarlo una vez", correctOpt: "A", explanation: "Reutilizar es aprovechar un objeto para otro propósito, extendiendo su vida útil y reduciendo residuos." },
          { question: "¿Qué beneficio principal tiene el reciclaje para el planeta?", optionA: "Reduce la basura y el uso de recursos naturales", optionB: "Aumenta la contaminación", correctOpt: "A", explanation: "Al reciclar, se necesita extraer menos materia prima nueva y se genera menos basura acumulada." },
        ],
      },
    ],
  },
];

async function main() {
  console.log("🌱 Iniciando seed de EcoEduca-AI (SRS v2, contenido PRO)...");

  // Limpieza de datos previos (orden por dependencias)
  await prisma.quizResponse.deleteMany();
  await prisma.aICache.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  // 1. Docente (login unificado por DNI)
  const teacherPasswordHash = await bcrypt.hash("docente123", 10);
  const teacher = await prisma.user.create({
    data: {
      fullName: "Prof. Rosa Quispe Mamani",
      role: "TEACHER",
      dni: "40000001",
      password: teacherPasswordHash,
    },
  });
  console.log(`✔ Docente creado: ${teacher.fullName} - DNI: ${teacher.dni} / clave: docente123`);

  // 2. Alumnos - 10 perfiles de accesibilidad (uno por perfil)
  const alumnosData: {
    fullName: string;
    grade: string;
    dni: string;
    password: string;
    disabilities: string[];
    accessProfile: string;
  }[] = [
    { fullName: "Jhamil Huamán", grade: "5to Grado B - Primaria", dni: "71234561", password: "alumno123", disabilities: [], accessProfile: "STANDARD" },
    { fullName: "María Quispe", grade: "5to Grado B - Primaria", dni: "71234562", password: "alumno123", disabilities: ["VISUAL"], accessProfile: "VISUAL" },
    { fullName: "Luis Mamani", grade: "5to Grado B - Primaria", dni: "71234563", password: "alumno123", disabilities: ["AUDITIVA"], accessProfile: "AUDITORY" },
    { fullName: "Ximena Flores", grade: "5to Grado B - Primaria", dni: "71234564", password: "alumno123", disabilities: ["MOTORA"], accessProfile: "MOTOR" },
    { fullName: "Diego Vargas", grade: "5to Grado B - Primaria", dni: "71234565", password: "alumno123", disabilities: ["DYSLEXIA"], accessProfile: "DYSLEXIA" },
    { fullName: "Sofía Rivas", grade: "5to Grado B - Primaria", dni: "71234566", password: "alumno123", disabilities: ["TDAH"], accessProfile: "ADHD" },
    { fullName: "Mateo Torres", grade: "5to Grado B - Primaria", dni: "71234567", password: "alumno123", disabilities: ["TEA"], accessProfile: "AUTISM" },
    { fullName: "Camila Vega", grade: "5to Grado B - Primaria", dni: "71234568", password: "alumno123", disabilities: [], accessProfile: "ADVANCED" },
    { fullName: "Lucas Paz", grade: "5to Grado B - Primaria", dni: "71234569", password: "alumno123", disabilities: [], accessProfile: "LANGUAGE" },
    { fullName: "Valeria Ruiz", grade: "5to Grado B - Primaria", dni: "71234570", password: "alumno123", disabilities: [], accessProfile: "NIGHT" },
  ];

  const alumnosCreados = [];
  for (const alumno of alumnosData) {
    const passwordHash = await bcrypt.hash(alumno.password, 10);
    const created = await prisma.user.create({
      data: {
        fullName: alumno.fullName,
        dni: alumno.dni,
        password: passwordHash,
        grade: alumno.grade,
        role: "STUDENT",
        disabilities: alumno.disabilities.length ? JSON.stringify(alumno.disabilities) : null,
        accessProfile: alumno.accessProfile as any,
      },
    });
    alumnosCreados.push(created);
    console.log(
      `✔ Alumno creado: ${created.fullName} (${alumno.accessProfile}) - DNI: ${alumno.dni} / clave: ${alumno.password}`
    );
  }

  // 3. Cursos curriculares con temas semanales (Topic) y quizzes (HU-03/HU-04)
  const cursosCreados = [];
  for (const { topics, ...curso } of cursosData) {
    const created = await prisma.course.create({ data: curso });
    cursosCreados.push(created);
    console.log(`✔ Curso creado: ${created.title} (${topics.length} temas semanales)`);

    let order = 1;
    for (const { quizzes, ...topic } of topics) {
      const createdTopic = await prisma.topic.create({
        data: { ...topic, courseId: created.id, order },
      });
      for (const quiz of quizzes) {
        await prisma.quiz.create({ data: { ...quiz, topicId: createdTopic.id } });
      }
      order += 1;
    }
  }

  // 4. Matrículas: todos los alumnos inscritos en todos los cursos
  for (const alumno of alumnosCreados) {
    for (const curso of cursosCreados) {
      await prisma.enrollment.create({
        data: { userId: alumno.id, courseId: curso.id },
      });
    }
  }
  console.log(`✔ Matrículas creadas: ${alumnosCreados.length * cursosCreados.length}`);

  // 5. Notas de ejemplo (escala MINEDU 0-20) para el primer curso
  const notasEjemplo = [16, 18, 14, 20, 12, 17, 19, 15, 13, 11];
  for (let i = 0; i < alumnosCreados.length; i++) {
    await prisma.grade.create({
      data: {
        userId: alumnosCreados[i].id,
        courseId: cursosCreados[0].id,
        score: notasEjemplo[i % notasEjemplo.length],
        comment: "Evaluación inicial del bimestre",
      },
    });
  }
  console.log("✔ Notas de ejemplo creadas para el curso Personal Social");

  // 6. Respuestas de ejemplo para el primer alumno (para demostrar gamificación: XP/racha/insignias)
  const primerAlumno = alumnosCreados[0];
  const temasCurso1 = await prisma.topic.findMany({
    where: { courseId: cursosCreados[0].id },
    include: { quizzes: true },
    orderBy: { order: "asc" },
  });
  const hoy = new Date();
  let diaOffset = 4;
  for (const tema of temasCurso1.slice(0, 2)) {
    for (const quiz of tema.quizzes) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - diaOffset);
      await prisma.quizResponse.create({
        data: {
          userId: primerAlumno.id,
          quizId: quiz.id,
          selectedOpt: quiz.correctOpt,
          isCorrect: true,
          modeUsed: primerAlumno.accessProfile,
          createdAt: fecha,
        },
      });
    }
    diaOffset -= 1;
  }
  console.log(`✔ Respuestas de ejemplo creadas para ${primerAlumno.fullName} (demo de XP/racha/insignias)`);

  // 7. Caché de IA de ejemplo (Eco-Prompting) con hits simulados
  const primerTema = temasCurso1[0];
  if (primerTema) {
    await prisma.aICache.create({
      data: {
        topicId: primerTema.id,
        profileType: "AUDITORY",
        aiContent: JSON.stringify({ type: "AUDITORY", blocks: [primerTema.summaryText] }),
        hitsCount: 3,
      },
    });
    console.log("✔ Entrada de AICache de ejemplo creada (3 peticiones de IA ya ahorradas)");
  }

  console.log("🌱 Seed finalizado con éxito.");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
