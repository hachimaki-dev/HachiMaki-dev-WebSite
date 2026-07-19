// Part 3: Lesson 3 - Explorar un dataset
export default [
  {
    title: "Explorar un Dataset - head, info, describe y Tipos de Datos",
    excerpt: "Antes de hacer cualquier análisis, necesitas entender qué tienes. Aprende las herramientas de exploración rápida de Pandas.",
    content: `# Lección 3: Explorar un Dataset — .head(), .info(), .describe() y Tipos de Datos

## 🎯 Objetivo de aprendizaje

**Una sola idea:** Aprender a obtener un resumen completo de cualquier dataset en 30 segundos usando \`.info()\` y \`.describe()\`.

---

## Requisitos previos

- **Lecciones 0-2 de este curso:** Importar Pandas, cargar CSV, acceder a columnas, usar \`.shape\`, \`.head()\`, \`.dtypes\`.

## ⏱️ Tiempo estimado: 25 minutos

---

## ¿Por qué existe este concepto?

Imagina que te dan un archivo con 50,000 filas y 30 columnas. No puedes leer cada fila. Necesitas respuestas rápidas: ¿Cuántas filas hay? ¿Hay datos faltantes? ¿Las edades van de 0 a 120 o hay un -999 escondido? ¿La columna "precio" es texto o número?

\`.info()\` y \`.describe()\` son como el panel de diagnóstico de un auto: te dicen el estado general sin necesidad de abrir el motor.

---

## Explicación intuitiva

Cuando un doctor te examina, no revisa cada célula de tu cuerpo. Hace un chequeo general:
- **Peso y altura** → \`.shape\` (dimensiones)
- **Análisis de sangre** → \`.info()\` (tipos de datos y valores faltantes)
- **Signos vitales** → \`.describe()\` (estadísticas resumen)

Con esos tres estudios, ya sabe si algo anda mal antes de hacer exámenes más profundos.

---

## Explicación técnica

| Método | ¿Qué muestra? | ¿Cuándo usarlo? |
|--------|---------------|-----------------|
| \`.shape\` | (filas, columnas) | Siempre, lo primero |
| \`.head(n)\` | Primeras n filas | Para ver ejemplos de datos |
| \`.tail(n)\` | Últimas n filas | Para verificar el final del archivo |
| \`.info()\` | Tipos, no-nulos, memoria | Para detectar faltantes y tipos incorrectos |
| \`.describe()\` | Estadísticas numéricas | Para detectar rangos raros y outliers |
| \`.nunique()\` | Valores únicos por columna | Para entender la cardinalidad |
| \`.value_counts()\` | Frecuencia de cada valor | Para columnas categóricas |

---

## 💻 Programa completo

\`\`\`python
# leccion_03_explorar.py
# Las herramientas de diagnóstico rápido de Pandas

import pandas as pd
import seaborn as sns

# Cargar dataset real
titanic = pd.read_csv("https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv")

# --- PASO 1: Dimensiones ---
print("=== PASO 1: DIMENSIONES ===")
print(f"Filas: {titanic.shape[0]}")
print(f"Columnas: {titanic.shape[1]}")

# --- PASO 2: Vista rápida ---
print("\\n=== PASO 2: PRIMERAS FILAS ===")
print(titanic.head())

# --- PASO 3: Info completa ---
print("\\n=== PASO 3: INFO ===")
print(titanic.info())

# --- PASO 4: Estadísticas numéricas ---
print("\\n=== PASO 4: DESCRIBE ===")
print(titanic.describe())

# --- PASO 5: Columnas categóricas ---
print("\\n=== PASO 5: COLUMNAS CATEGÓRICAS ===")
print("Valores únicos por columna:")
print(titanic.nunique())

print("\\nDistribución de Sex:")
print(titanic["Sex"].value_counts())

print("\\nDistribución de Pclass:")
print(titanic["Pclass"].value_counts())

print("\\nDistribución de Embarked:")
print(titanic["Embarked"].value_counts())

# --- PASO 6: Detectar problemas ---
print("\\n=== PASO 6: ¿HAY PROBLEMAS? ===")
nulos = titanic.isnull().sum()
nulos_filtrados = nulos[nulos > 0]
print("Columnas con valores faltantes:")
print(nulos_filtrados)
print(f"\\nPorcentaje de Age faltante: {titanic['Age'].isnull().mean()*100:.1f}%")
\`\`\`

---

## 🔍 Explicación línea por línea

- **\`titanic.info()\`:** Imprime un resumen completo. Muestra cada columna, cuántos valores no-nulos tiene, el tipo de dato y el uso total de memoria. Es el método más informativo con una sola línea.
- **\`titanic.describe()\`:** Calcula estadísticas solo para columnas numéricas: count (no-nulos), mean (promedio), std (desviación estándar), min, 25%, 50% (mediana), 75%, max. Si ves un min de -999 en "edad", algo anda mal.
- **\`titanic.nunique()\`:** Cuenta valores únicos por columna. Si "sexo" tiene 2 valores únicos, bien. Si tiene 50, algo está mal codificado.
- **\`value_counts()\`:** Cuenta cuántas veces aparece cada valor en una columna. Fundamental para columnas categóricas. Por defecto ordena de mayor a menor.
- **\`isnull().sum()\`:** \`isnull()\` crea un DataFrame de True/False (True = faltante). \`.sum()\` cuenta los True por columna.
- **\`isnull().mean()\`:** Proporción de faltantes (0.0 a 1.0). Multiplicamos por 100 para obtener porcentaje.
- **\`nulos[nulos > 0]\`:** Filtra para mostrar solo columnas que SÍ tienen faltantes. Esto es una condición booleana aplicada a una Serie — lo profundizaremos en la Lección 5.

---

## 📊 Visualización

\`\`\`
SALIDA DE .info():

<class 'pandas.core.frame.DataFrame'>
RangeIndex: 891 entries, 0 to 890
Data columns (total 12 columns):
 #   Column       Non-Null Count  Dtype
---  ------       --------------  -----
 0   PassengerId  891 non-null    int64    ← 891/891 = completa
 1   Survived     891 non-null    int64
 2   Pclass       891 non-null    int64
 3   Name         891 non-null    object
 4   Sex          891 non-null    object
 5   Age          714 non-null    float64  ← ¡177 faltantes!
 6   SibSp        891 non-null    int64
 7   Parch        891 non-null    int64
 8   Ticket       891 non-null    object
 9   Fare         891 non-null    float64
10   Cabin        204 non-null    object   ← ¡687 faltantes!
11   Embarked     889 non-null    object   ← 2 faltantes

SALIDA DE .describe():

       PassengerId  Survived    Pclass       Age      Fare
count   891.000     891.000    891.000   714.000   891.000
mean    446.000       0.384      2.309    29.699    32.204
std     257.354       0.487      0.836    14.526    49.693
min       1.000       0.000      1.000     0.420     0.000 ← bebé de 5 meses
25%     223.500       0.000      2.000    20.125     7.910
50%     446.000       0.000      3.000    28.000    14.454
75%     668.500       1.000      3.000    38.000    31.000
max     891.000       1.000      3.000    80.000   512.329 ← ¡tarifa altísima!
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: describe para texto
\`\`\`python
print(titanic.describe(include="object"))
\`\`\`
> **Observa:** Con \`include="object"\` muestra estadísticas de columnas de texto: count, unique, top (valor más frecuente) y freq (frecuencia del más frecuente).

### Experimento 2: ¿Qué valores tiene Embarked?
\`\`\`python
print(titanic["Embarked"].value_counts())
print(titanic["Embarked"].unique())
\`\`\`
> **Predice:** ¿Cuántos puertos de embarque hay? ¿Aparece \`NaN\` en \`.unique()\`?

### Experimento 3: El dataset penguins
\`\`\`python
penguins = sns.load_dataset("penguins")
print(penguins.info())
print(penguins.describe())
print(penguins.isnull().sum())
\`\`\`
> **Analiza:** ¿Qué columnas tienen faltantes? ¿Cuántos? ¿Qué porcentaje del total representan?

---

## ⚠️ Errores comunes

**Error 1: Confundir info() con describe()**
\`\`\`python
# info() muestra tipos y nulos → diagnóstico estructural
# describe() muestra estadísticas → diagnóstico numérico
# ¡Necesitas AMBOS para un diagnóstico completo!
\`\`\`

**Error 2: Ignorar columnas con tipo incorrecto**
\`\`\`python
# Si "edad" aparece como object en .info(), es texto, no número
# Eso significa que tiene valores como "treinta" o "N/A" mezclados
# No podrás calcular .mean() hasta convertirlo
\`\`\`

**Error 3: Asumir que describe() muestra todas las columnas**
\`\`\`python
# ❌ Solo muestra numéricas por defecto
print(titanic.describe())  # No ves Name, Sex, Ticket...

# ✅ Para ver todas
print(titanic.describe(include="all"))
\`\`\`

---

## 🏆 Desafío

Carga el dataset \`"diamonds"\` de Seaborn y responde:
1. ¿Cuántas filas y columnas tiene?
2. ¿Hay valores faltantes en alguna columna?
3. ¿Cuál es el precio (price) mínimo, máximo y promedio?
4. ¿Cuántos tipos de corte (cut) existen y cuál es el más frecuente?

<details>
<summary>Ver solución</summary>

\`\`\`python
import seaborn as sns
diamonds = sns.load_dataset("diamonds")
print(f"1. Forma: {diamonds.shape}")
print(f"2. Faltantes:\\n{diamonds.isnull().sum()}")
stats = diamonds["price"].describe()
print(f"3. Precio min: \${stats['min']:.0f}, max: \${stats['max']:.0f}, mean: \${stats['mean']:.0f}")
print(f"4. Tipos de cut:\\n{diamonds['cut'].value_counts()}")
\`\`\`
</details>

---

## 🧠 Autoevaluación

1. **¿Qué método muestra tipos de datos y valores no-nulos?** → \`.info()\`
2. **¿Qué método muestra estadísticas como media, min y max?** → \`.describe()\`
3. **¿Cómo cuentas valores faltantes por columna?** → \`df.isnull().sum()\`

---

## 📖 Glosario

| Término | Definición |
|---------|-----------|
| **info()** | Resumen estructural: tipos, no-nulos, memoria |
| **describe()** | Resumen estadístico: count, mean, std, min, quartiles, max |
| **nunique()** | Número de valores únicos por columna |
| **value_counts()** | Frecuencia de cada valor en una columna |
| **NaN** | Not a Number: valor faltante en Pandas (equivalente a "celda vacía") |
| **isnull()** | Devuelve True donde hay NaN |

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| \`.info()\` | Tipos, no-nulos, memoria |
| \`.describe()\` | Estadísticas numéricas |
| \`.describe(include="object")\` | Estadísticas de texto |
| \`.nunique()\` | Valores únicos por columna |
| \`.value_counts()\` | Frecuencia de valores (Serie) |
| \`.isnull().sum()\` | Cantidad de faltantes por columna |
| \`.isnull().mean()\` | Proporción de faltantes (0-1) |

---

## ➡️ ¿Qué sigue y por qué?

Ya sabemos diagnosticar un dataset. Y el diagnóstico reveló algo preocupante: **columnas con datos faltantes**. Age tiene 177 valores faltantes, Cabin tiene 687. ¿Los eliminamos? ¿Los rellenamos? ¿Depende del caso? En la próxima lección aprenderemos a **manejar datos faltantes**, la habilidad más práctica de un científico de datos.
`
  }
]
