// Part 1: Lesson 0 (Setup) + Lesson 1 (Pandas DataFrame)
export default [
  {
    title: "Preparando tu Laboratorio de Datos",
    excerpt: "Antes de analizar datos, necesitamos las herramientas correctas. Instalamos Pandas y Seaborn en Google Colab y verificamos que todo funcione.",
    content: `# Lección 0: Preparando tu Laboratorio de Datos

## 🎯 Objetivo de aprendizaje

**Una sola idea:** Verificar que tu entorno de Google Colab tiene Pandas, Matplotlib y Seaborn listos para usar, y entender qué hace cada biblioteca.

---

## Requisitos previos

- **Curso 1, Lección 1-4:** Saber abrir Google Colab, ejecutar celdas, usar \`import\` y \`print()\`.
- Recuerda que en el Curso 1 escribimos \`import numpy as np\`. Aquí haremos lo mismo con nuevas bibliotecas.

## ⏱️ Tiempo estimado: 15 minutos

---

## ¿Por qué existe este concepto?

En el Curso 1, todos los datasets venían perfectos: \`keras.datasets.mnist\` ya estaba limpio, normalizado y listo. Pero en el mundo real, los datos llegan en archivos CSV desordenados, con valores faltantes, columnas mal nombradas y formatos inconsistentes.

Necesitamos herramientas especializadas para manejar ese caos. NumPy es excelente para cálculos numéricos, pero no sabe leer un archivo Excel ni hacer un gráfico. Para eso existen Pandas, Matplotlib y Seaborn.

---

## Explicación intuitiva

Piensa en un taller mecánico:
- **NumPy** es el motor: potente, rápido, pero no puedes conducir solo un motor.
- **Pandas** es el chasis y el volante: te permite cargar datos, organizarlos y navegar por ellos.
- **Matplotlib** es el tablero de instrumentos: te muestra gráficos de lo que está pasando.
- **Seaborn** es el tablero premium: los mismos instrumentos, pero más bonitos y con funciones automáticas.

---

## Explicación técnica

| Biblioteca | Import estándar | ¿Qué hace? |
|------------|----------------|-------------|
| \`pandas\` | \`import pandas as pd\` | Carga, organiza y manipula datos tabulares |
| \`matplotlib\` | \`import matplotlib.pyplot as plt\` | Crea gráficos básicos (líneas, barras, dispersión) |
| \`seaborn\` | \`import seaborn as sns\` | Gráficos estadísticos avanzados sobre Matplotlib |
| \`numpy\` | \`import numpy as np\` | Cálculos numéricos (ya lo conoces del Curso 1) |

Los alias (\`pd\`, \`plt\`, \`sns\`, \`np\`) son convenciones universales. Si escribes \`import pandas as banana\`, funciona, pero nadie en el mundo lo hace así y tu código será ilegible.

Google Colab ya trae todas estas bibliotecas preinstaladas. No necesitas instalar nada.

---

## 💻 Programa completo

\`\`\`python
# leccion_00_setup.py
# Verificamos que todo esté instalado y funcionando

# Paso 1: Importar las bibliotecas
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Paso 2: Verificar versiones
print("=== VERSIONES INSTALADAS ===")
print(f"Pandas:     {pd.__version__}")
print(f"NumPy:      {np.__version__}")
print(f"Matplotlib: {plt.matplotlib.__version__}")
print(f"Seaborn:    {sns.__version__}")

# Paso 3: Prueba rápida - crear un mini DataFrame
datos = {
    "nombre": ["Ada", "Alan", "Grace"],
    "edad": [36, 41, 85],
    "lenguaje": ["Ada", "Turing Machine", "COBOL"]
}
df = pd.DataFrame(datos)
print("\\n=== MI PRIMER DATAFRAME ===")
print(df)

# Paso 4: Prueba rápida - un gráfico simple
plt.figure(figsize=(6, 3))
plt.bar(df["nombre"], df["edad"], color=["#8b5cf6", "#06b6d4", "#f59e0b"])
plt.title("Edad de pioneros de la computación")
plt.ylabel("Edad")
plt.tight_layout()
plt.show()
print("\\n✅ Si ves la tabla y el gráfico, ¡todo funciona!")
\`\`\`

---

## 🔍 Explicación línea por línea

- **\`import pandas as pd\`:** Carga la biblioteca Pandas y le asigna el alias \`pd\`. A partir de aquí, todo lo de Pandas se accede con \`pd.algo()\`.
- **\`pd.__version__\`:** Atributo especial que muestra la versión instalada. El doble guion bajo (\`__\`) indica que es un atributo interno de Python.
- **\`datos = { ... }\`:** Un diccionario de Python (lo viste brevemente en el Curso 1). Las claves son nombres de columna, los valores son listas con los datos.
- **\`pd.DataFrame(datos)\`:** Convierte el diccionario en una tabla estructurada. Esto es el corazón de Pandas.
- **\`df["nombre"]\`:** Accede a la columna "nombre" del DataFrame. Devuelve una Serie (como una lista con superpoderes).
- **\`plt.bar(...)\`:** Crea un gráfico de barras. El primer argumento son las categorías (eje X), el segundo los valores (eje Y).
- **\`plt.show()\`:** Muestra el gráfico en pantalla. Sin esta línea, el gráfico se crea pero no se muestra.

---

## 📊 Visualización

\`\`\`
SALIDA DEL PROGRAMA:

=== VERSIONES INSTALADAS ===
Pandas:     2.x.x
NumPy:      1.x.x
Matplotlib: 3.x.x
Seaborn:    0.1x.x

=== MI PRIMER DATAFRAME ===
  nombre  edad         lenguaje
0    Ada    36              Ada
1   Alan    41   Turing Machine
2  Grace    85            COBOL

   Edad de pioneros
   |
85 |              ██
   |              ██
41 |     ██       ██
36 | ██  ██       ██
   +---+----+------+
     Ada Alan  Grace
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: ¿Qué tipo es un DataFrame?
\`\`\`python
print(type(df))
print(type(df["edad"]))
\`\`\`
> **Predice:** ¿Qué tipos mostrará? ¿Es un DataFrame lo mismo que un diccionario?

### Experimento 2: DataFrame vs NumPy array
\`\`\`python
array_edades = np.array([36, 41, 85])
serie_edades = df["edad"]
print("NumPy:", array_edades)
print("Pandas:", serie_edades)
print("¿Son iguales?", np.array_equal(array_edades, serie_edades.values))
\`\`\`
> **Observa:** \`.values\` convierte una Serie de Pandas a un array de NumPy. El puente entre ambos mundos.

### Experimento 3: Cambia el gráfico
\`\`\`python
plt.figure(figsize=(6, 3))
plt.barh(df["nombre"], df["edad"], color="#8b5cf6")  # barh = horizontal
plt.title("Edad de pioneros")
plt.xlabel("Edad")
plt.tight_layout()
plt.show()
\`\`\`
> **Observa:** \`plt.barh\` hace barras horizontales. ¿Cuál te parece más legible?

---

## ⚠️ Errores comunes

**Error 1: Olvidar el alias**
\`\`\`python
# ❌ NameError: name 'pandas' is not defined
import pandas as pd
datos = pandas.DataFrame({"a": [1]})

# ✅ Usa el alias que definiste
datos = pd.DataFrame({"a": [1]})
\`\`\`

**Error 2: Escribir mal el import de Matplotlib**
\`\`\`python
# ❌ ModuleNotFoundError
import matplotlib as plt

# ✅ Correcto: el submódulo pyplot
import matplotlib.pyplot as plt
\`\`\`

**Error 3: No ejecutar \`plt.show()\`**
\`\`\`python
# ❌ No aparece nada (fuera de Colab)
plt.bar(["A", "B"], [1, 2])

# ✅ Siempre cierra con show()
plt.bar(["A", "B"], [1, 2])
plt.show()
\`\`\`

---

## 🏆 Desafío

Crea un DataFrame con datos de 5 películas que te gusten. Incluye columnas: \`titulo\`, \`año\`, \`calificacion\` (del 1 al 10). Luego haz un gráfico de barras mostrando la calificación de cada película.

<details>
<summary>Ver solución</summary>

\`\`\`python
import pandas as pd
import matplotlib.pyplot as plt

peliculas = {
    "titulo": ["Inception", "Interstellar", "Matrix", "Coco", "Parasite"],
    "año": [2010, 2014, 1999, 2017, 2019],
    "calificacion": [9, 10, 9, 8, 10]
}
df = pd.DataFrame(peliculas)
print(df)

plt.figure(figsize=(8, 4))
plt.bar(df["titulo"], df["calificacion"], color="#8b5cf6")
plt.title("Mis películas favoritas")
plt.ylabel("Calificación")
plt.ylim(0, 10)
plt.tight_layout()
plt.show()
\`\`\`
</details>

---

## 🧠 Autoevaluación

1. **¿Cuál es el alias estándar de Pandas?** → \`pd\`
2. **¿Qué función convierte un diccionario en tabla?** → \`pd.DataFrame()\`
3. **¿Qué línea necesitas para que un gráfico aparezca en pantalla?** → \`plt.show()\`

---

## 📖 Glosario

| Término | Definición |
|---------|-----------|
| **Pandas** | Biblioteca de Python para manipulación de datos tabulares |
| **DataFrame** | Estructura de datos tipo tabla con filas y columnas |
| **Series** | Una sola columna de un DataFrame (como un array con etiqueta) |
| **Matplotlib** | Biblioteca base para crear gráficos en Python |
| **Seaborn** | Biblioteca de gráficos estadísticos construida sobre Matplotlib |

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| \`import pandas as pd\` | Carga Pandas con alias estándar |
| \`pd.DataFrame(dict)\` | Crea tabla a partir de diccionario |
| \`df["columna"]\` | Accede a una columna (devuelve Serie) |
| \`plt.bar(x, y)\` | Gráfico de barras |
| \`plt.show()\` | Muestra el gráfico en pantalla |

---

## ➡️ ¿Qué sigue y por qué?

Ya verificamos que las herramientas funcionan y creamos nuestro primer DataFrame manualmente. Pero en la vida real nadie escribe los datos a mano — vienen en archivos CSV, Excel o bases de datos. En la próxima lección aprenderemos a **cargar datos reales** desde archivos, que es donde empieza el verdadero trabajo de un científico de datos.
`
  },
  {
    title: "Pandas y el DataFrame - La Hoja de Cálculo de Python",
    excerpt: "El DataFrame es la estructura central de la ciencia de datos. Aprende a crearlo, explorarlo y entender su anatomía básica.",
    content: `# Lección 1: Pandas y el DataFrame — La Hoja de Cálculo de Python

## 🎯 Objetivo de aprendizaje

**Una sola idea:** Entender que un DataFrame es una tabla con filas y columnas donde cada columna puede tener un tipo de dato diferente, y aprender a explorar su estructura básica.

---

## Requisitos previos

- **Lección 0 de este curso:** Saber importar Pandas y crear un DataFrame básico.
- **Curso 1, Lección 3:** Conocer arrays de NumPy (shape, tipos de datos).

## ⏱️ Tiempo estimado: 30 minutos

---

## ¿Por qué existe este concepto?

Recuerda el array de NumPy del Curso 1: una cuadrícula de números, todos del mismo tipo. Eso es perfecto para matrices de píxeles o pesos de una red neuronal. Pero los datos del mundo real son más complicados:

Imagina una tabla de pacientes de un hospital: nombre (texto), edad (entero), temperatura (decimal), ¿tiene fiebre? (sí/no). NumPy no puede mezclar texto con números en un mismo array. Pandas sí.

---

## Explicación intuitiva

Si NumPy es una **hoja de papel cuadriculado** donde solo puedes escribir números, un DataFrame es una **hoja de cálculo de Excel**:

- Tiene **columnas con nombres** (Nombre, Edad, Temperatura)
- Cada columna puede tener **un tipo diferente** (texto, número, fecha)
- Cada fila tiene un **índice** (como el número de fila en Excel)
- Puedes filtrar, ordenar y agrupar sin escribir fórmulas complicadas

---

## Explicación técnica

Un DataFrame tiene tres componentes:

1. **Índice (index):** Etiquetas de cada fila. Por defecto: 0, 1, 2, ...
2. **Columnas (columns):** Nombres de cada columna.
3. **Valores (values):** Los datos en sí, almacenados internamente como arrays de NumPy.

Cada columna es un objeto **Series**: un array de NumPy con nombre y con índice.

\`\`\`
                    columnas
                ┌──────────────────────────┐
                │  nombre   edad   fiebre  │
         ┌──────┼──────────────────────────┤
índice   │  0   │  "Ada"     36    False   │
         │  1   │  "Alan"    41    True    │
         │  2   │  "Grace"   85    False   │
         └──────┼──────────────────────────┤
                └──────────────────────────┘
                      valores (values)
\`\`\`

Tipos de datos comunes en Pandas:

| Tipo Pandas | Equivalente Python | Ejemplo |
|------------|-------------------|---------|
| \`int64\` | \`int\` | 42, -3, 1000 |
| \`float64\` | \`float\` | 3.14, -0.001 |
| \`object\` | \`str\` | "hola", "Ada" |
| \`bool\` | \`bool\` | True, False |
| \`datetime64\` | \`datetime\` | 2024-01-15 |

---

## 💻 Programa completo

\`\`\`python
# leccion_01_dataframe.py
# Anatomía del DataFrame: entendiendo la estructura central de Pandas

import pandas as pd
import numpy as np
import seaborn as sns

# --- PARTE 1: Crear un DataFrame desde diccionario ---
print("=== CREAR DATAFRAME DESDE DICCIONARIO ===")
datos = {
    "ciudad": ["Santiago", "Buenos Aires", "Lima", "Bogotá", "CDMX"],
    "poblacion_millones": [6.3, 15.4, 10.9, 8.1, 21.8],
    "pais": ["Chile", "Argentina", "Perú", "Colombia", "México"],
    "es_capital": [True, True, True, True, True]
}
df_ciudades = pd.DataFrame(datos)
print(df_ciudades)

# --- PARTE 2: Anatomía del DataFrame ---
print("\\n=== ANATOMÍA ===")
print(f"Forma (filas, columnas): {df_ciudades.shape}")
print(f"Columnas: {list(df_ciudades.columns)}")
print(f"Índice: {list(df_ciudades.index)}")
print(f"\\nTipos de datos:")
print(df_ciudades.dtypes)

# --- PARTE 3: Usar un dataset real de Seaborn ---
print("\\n=== DATASET REAL: TIPS (PROPINAS) ===")
tips = sns.load_dataset("tips")
print(f"Forma: {tips.shape}")
print(f"Columnas: {list(tips.columns)}")
print(f"\\nPrimeras 5 filas:")
print(tips.head())
print(f"\\nÚltimas 3 filas:")
print(tips.tail(3))

# --- PARTE 4: Acceder a columnas individuales (Series) ---
print("\\n=== COLUMNAS COMO SERIES ===")
propinas = tips["tip"]
print(f"Tipo: {type(propinas)}")
print(f"Nombre: {propinas.name}")
print(f"Largo: {len(propinas)}")
print(f"Primeros 5 valores:\\n{propinas.head()}")

# --- PARTE 5: El puente NumPy ↔ Pandas ---
print("\\n=== NUMPY ↔ PANDAS ===")
array_propinas = propinas.values
print(f"Tipo del array: {type(array_propinas)}")
print(f"Shape: {array_propinas.shape}")
print(f"Dtype: {array_propinas.dtype}")
print(f"Media (NumPy): {np.mean(array_propinas):.2f}")
print(f"Media (Pandas): {propinas.mean():.2f}")
\`\`\`

---

## 🔍 Explicación línea por línea

- **\`pd.DataFrame(datos)\`:** Convierte el diccionario en tabla. Cada clave se vuelve columna, cada lista se vuelve los valores de esa columna. Todas las listas deben tener el mismo largo.
- **\`df_ciudades.shape\`:** Devuelve una tupla \`(filas, columnas)\`. Recuerda \`.shape\` de NumPy — es el mismo concepto.
- **\`df_ciudades.columns\`:** Devuelve los nombres de las columnas. Es un objeto especial de Pandas (Index), por eso lo envolvemos en \`list()\` para verlo limpio.
- **\`df_ciudades.dtypes\`:** Muestra el tipo de dato de cada columna. Nota: texto aparece como \`object\`, no como \`str\`.
- **\`sns.load_dataset("tips")\`:** Carga un dataset real incluido en Seaborn. Es un registro de propinas en un restaurante de EE.UU. con 244 filas.
- **\`tips.head()\`:** Muestra las primeras 5 filas. Sin argumento = 5. Con argumento: \`.head(10)\` muestra 10.
- **\`tips.tail(3)\`:** Muestra las últimas 3 filas. Útil para verificar que el archivo se cargó completo.
- **\`tips["tip"]\`:** Extrae la columna "tip" como una Serie de Pandas.
- **\`propinas.values\`:** Convierte la Serie a un array de NumPy. Este es el puente: Pandas para explorar, NumPy para calcular.
- **\`propinas.mean()\`:** Pandas tiene sus propios métodos estadísticos. Da el mismo resultado que \`np.mean()\`.

---

## 📊 Visualización

\`\`\`
SALIDA DE tips.head():

   total_bill   tip     sex smoker  day    time  size
0       16.99  1.01  Female     No  Sun  Dinner     2
1       10.34  1.66    Male     No  Sun  Dinner     3
2       21.01  3.50    Male     No  Sun  Dinner     3
3       23.68  3.31    Male     No  Sun  Dinner     2
4       24.59  3.61  Female     No  Sun  Dinner     4

ANATOMÍA VISUAL:

    Index       Columnas (7 en total)
     │     total_bill  tip  sex  smoker  day  time  size
     ▼    ┌──────────────────────────────────────────────┐
     0    │  16.99    1.01  F    No     Sun  Din    2    │
     1    │  10.34    1.66  M    No     Sun  Din    3    │
     ...  │  ...     ...   ...  ...    ...  ...   ...   │
    243   │  18.78    3.00  F    No     Thu  Din    2    │
          └──────────────────────────────────────────────┘
          244 filas × 7 columnas

TIPOS:
  total_bill → float64 (decimales)
  tip        → float64
  sex        → object  (texto/categoría)
  smoker     → object
  day        → object
  time       → object
  size       → int64   (enteros)
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: ¿Cuántas filas tiene?
\`\`\`python
print(len(tips))
print(tips.shape[0])
print(tips.shape[1])
\`\`\`
> **Predice:** ¿\`len()\` devuelve filas o columnas? ¿\`shape[0]\` es filas o columnas?

### Experimento 2: Columna que no existe
\`\`\`python
print(tips["propina"])  # ¿Funciona?
\`\`\`
> **Predice:** ¿Qué error obtienes? La columna se llama "tip", no "propina".

### Experimento 3: Dos formas de acceder a columnas
\`\`\`python
print(tips["tip"].head(3))
print(tips.tip.head(3))
\`\`\`
> **Observa:** Ambas funcionan, pero \`tips["tip"]\` es más segura. La notación punto falla si la columna tiene espacios o se llama igual que un método de Pandas.

### Experimento 4: De NumPy a DataFrame
\`\`\`python
array_2d = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
df_desde_numpy = pd.DataFrame(array_2d, columns=["A", "B", "C"])
print(df_desde_numpy)
\`\`\`
> **Observa:** Puedes crear un DataFrame desde un array de NumPy. Solo necesitas darle nombres a las columnas.

---

## ⚠️ Errores comunes

**Error 1: Listas de diferente largo**
\`\`\`python
# ❌ ValueError: All arrays must be of the same length
datos_mal = {
    "nombre": ["Ada", "Alan"],
    "edad": [36, 41, 85]  # 3 elementos vs 2
}
pd.DataFrame(datos_mal)
\`\`\`

**Error 2: KeyError al acceder a columna inexistente**
\`\`\`python
# ❌ KeyError: 'Tip' (mayúscula)
tips["Tip"]

# ✅ Pandas distingue mayúsculas
tips["tip"]
\`\`\`

**Error 3: Confundir DataFrame con diccionario**
\`\`\`python
# ❌ Esto NO funciona como un diccionario
tips[0]  # KeyError: 0 (no accede a la fila 0)

# ✅ Para acceder a filas, usa .iloc (lo veremos en Lección 5)
tips.iloc[0]
\`\`\`

---

## 🏆 Desafío

Carga el dataset \`"penguins"\` de Seaborn. Sin buscar documentación, usa lo que aprendiste para responder:
1. ¿Cuántas filas y columnas tiene?
2. ¿Cuáles son los nombres de las columnas?
3. ¿Qué tipo de dato tiene cada columna?
4. ¿Cuál es el promedio de la columna \`"body_mass_g"\`?

<details>
<summary>Ver solución</summary>

\`\`\`python
import seaborn as sns
penguins = sns.load_dataset("penguins")
print(f"1. Forma: {penguins.shape}")
print(f"2. Columnas: {list(penguins.columns)}")
print(f"3. Tipos:\\n{penguins.dtypes}")
print(f"4. Masa promedio: {penguins['body_mass_g'].mean():.1f} g")
\`\`\`
</details>

---

## 🧠 Autoevaluación

1. **¿Qué devuelve \`df.shape\`?** → Una tupla \`(filas, columnas)\`
2. **¿Qué tipo tiene una columna de texto en Pandas?** → \`object\`
3. **¿Cómo conviertes una Serie de Pandas a un array de NumPy?** → \`serie.values\`

---

## 📖 Glosario

| Término | Definición |
|---------|-----------|
| **DataFrame** | Tabla bidimensional con columnas nombradas y tipadas |
| **Series** | Una columna individual de un DataFrame (array + índice + nombre) |
| **Index** | Etiquetas de las filas (por defecto: 0, 1, 2, ...) |
| **dtypes** | Tipos de datos de cada columna del DataFrame |
| **head() / tail()** | Métodos para ver las primeras / últimas filas |

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| \`pd.DataFrame(dict)\` | Crea tabla desde diccionario |
| \`df.shape\` | Tupla (filas, columnas) |
| \`df.columns\` | Nombres de columnas |
| \`df.dtypes\` | Tipo de dato por columna |
| \`df.head(n)\` | Primeras n filas (defecto: 5) |
| \`df["col"]\` | Accede a una columna como Serie |
| \`serie.values\` | Convierte Serie a array NumPy |
| \`sns.load_dataset()\` | Carga datasets de ejemplo |

---

## ➡️ ¿Qué sigue y por qué?

Ya sabemos qué es un DataFrame y cómo explorar su estructura. Pero lo creamos a mano o lo cargamos con Seaborn. En la vida real, tus datos están en archivos CSV, Excel o bases de datos. En la próxima lección aprenderemos a **cargar datos desde archivos reales**, incluyendo los problemas que siempre aparecen: encoding incorrecto, separadores raros y columnas mal formateadas.
`
  }
]
