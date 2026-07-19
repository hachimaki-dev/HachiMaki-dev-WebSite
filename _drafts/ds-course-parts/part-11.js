// Part 11: Lesson 11 - De DataFrame a NumPy
export default [
  {
    title: "De DataFrame a NumPy Array - El Puente hacia el Modelado",
    excerpt: "Conecta lo aprendido en este curso con el Curso 1: transforma DataFrames limpios en arrays listos para alimentar redes neuronales.",
    content: `# Lección 11: De DataFrame a NumPy Array — El Puente hacia el Modelado

## 🎯 Objetivo de aprendizaje

**Una sola idea:** Aprender a transformar un DataFrame limpio de Pandas en arrays de NumPy listos para alimentar un modelo de machine learning, incluyendo la codificación de variables categóricas y la normalización.

---

## Requisitos previos

- **Lecciones 0-10 de este curso:** Todo lo aprendido (carga, limpieza, filtrado, visualización).
- **Curso 1, Lecciones 3-4:** NumPy arrays, shape, tipos de datos.
- **Curso 1, Lecciones 9-10:** Keras, \`model.fit(X, y)\`, normalización de datos.

## ⏱️ Tiempo estimado: 35 minutos

---

## ¿Por qué existe este concepto?

Recuerda el Curso 1: para entrenar una red neuronal con Keras necesitabas:
\`\`\`python
model.fit(X_train, y_train, epochs=10)
\`\`\`

Donde \`X_train\` y \`y_train\` son arrays de NumPy con **solo números**. Pero nuestro DataFrame del Titanic tiene texto ("male", "female"), categorías ("S", "C", "Q") y valores faltantes. Ningún modelo puede comer eso directamente.

Esta lección es el puente: de DataFrame desordenado → array numérico limpio.

---

## Explicación intuitiva

Piensa en una receta de cocina:
1. **Pandas** fue el supermercado: elegiste ingredientes, descartaste los podridos, los organizaste.
2. **Esta lección** es la preparación: picas, pelas, mides las porciones.
3. **NumPy/Keras** (Curso 1) es el horno: recibe ingredientes preparados y cocina el modelo.

Sin la preparación, el horno no funciona.

---

## Explicación técnica

Pasos para convertir un DataFrame a datos modelables:

| Paso | Operación | Herramienta |
|------|-----------|-------------|
| 1. Seleccionar columnas | Elegir features (X) y target (y) | \`df[cols]\` |
| 2. Manejar faltantes | Imputar o eliminar | \`fillna()\`, \`dropna()\` |
| 3. Codificar categorías | Texto → números | \`pd.get_dummies()\` |
| 4. Convertir a NumPy | DataFrame → array | \`.values\` o \`.to_numpy()\` |
| 5. Normalizar | Escalar valores al rango 0-1 | Fórmula: (x - min) / (max - min) |

---

## 💻 Programa completo

\`\`\`python
# leccion_11_puente_numpy.py
# De DataFrame desordenado a arrays listos para modelado

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Cargar datos
url = "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv"
titanic = pd.read_csv(url)
print(f"Datos originales: {titanic.shape}")

# --- PASO 1: Seleccionar columnas útiles ---
print("\\n=== PASO 1: SELECCIONAR FEATURES ===")
columnas = ["Survived", "Pclass", "Sex", "Age", "SibSp", "Parch", "Fare", "Embarked"]
df = titanic[columnas].copy()
print(f"Columnas seleccionadas: {list(df.columns)}")
print(f"Forma: {df.shape}")

# --- PASO 2: Manejar faltantes ---
print("\\n=== PASO 2: MANEJAR FALTANTES ===")
print(f"Faltantes antes:\\n{df.isnull().sum()}")
df["Age"] = df["Age"].fillna(df["Age"].median())
df["Embarked"] = df["Embarked"].fillna(df["Embarked"].mode().iloc[0])
print(f"\\nFaltantes después: {df.isnull().sum().sum()}")

# --- PASO 3: Codificar variables categóricas ---
print("\\n=== PASO 3: CODIFICAR CATEGORÍAS ===")
print(f"Antes - Columnas: {list(df.columns)}")
print(f"Antes - Tipos:\\n{df.dtypes}")

# One-hot encoding con get_dummies
df_encoded = pd.get_dummies(df, columns=["Sex", "Embarked"], drop_first=True)
print(f"\\nDespués - Columnas: {list(df_encoded.columns)}")
print(df_encoded.head())

# --- PASO 4: Separar features (X) y target (y) ---
print("\\n=== PASO 4: SEPARAR X e y ===")
y = df_encoded["Survived"].values
X = df_encoded.drop(columns=["Survived"]).values

print(f"X shape: {X.shape}  (filas × features)")
print(f"y shape: {y.shape}  (filas,)")
print(f"X dtype: {X.dtype}")
print(f"y dtype: {y.dtype}")
print(f"\\nPrimera fila de X: {X[0]}")
print(f"Primera etiqueta y: {y[0]}")

# --- PASO 5: Normalizar features ---
print("\\n=== PASO 5: NORMALIZAR ===")
print(f"Antes - Rango de cada feature:")
for i, col in enumerate(df_encoded.drop(columns=["Survived"]).columns):
    print(f"  {col}: min={X[:, i].min():.2f}, max={X[:, i].max():.2f}")

# Normalización min-max: (x - min) / (max - min)
X_min = X.min(axis=0)
X_max = X.max(axis=0)
# Evitar división por cero (columnas binarias con max=min+1 están bien)
rango = X_max - X_min
rango[rango == 0] = 1  # Si min==max, no escalar
X_norm = (X - X_min) / rango

print(f"\\nDespués - Rango de cada feature:")
for i, col in enumerate(df_encoded.drop(columns=["Survived"]).columns):
    print(f"  {col}: min={X_norm[:, i].min():.2f}, max={X_norm[:, i].max():.2f}")

# --- PASO 6: Dividir en entrenamiento y prueba ---
print("\\n=== PASO 6: TRAIN/TEST SPLIT ===")
np.random.seed(42)
indices = np.random.permutation(len(X_norm))
n_train = int(0.8 * len(X_norm))

X_train = X_norm[indices[:n_train]]
y_train = y[indices[:n_train]]
X_test = X_norm[indices[n_train:]]
y_test = y[indices[n_train:]]

print(f"Entrenamiento: X={X_train.shape}, y={y_train.shape}")
print(f"Prueba:        X={X_test.shape}, y={y_test.shape}")
print(f"\\n✅ ¡Datos listos para model.fit(X_train, y_train)!")

# --- VERIFICACIÓN VISUAL ---
print("\\n=== VERIFICACIÓN VISUAL ===")
fig, axes = plt.subplots(1, 2, figsize=(12, 4))

axes[0].hist(X_train[:, 2], bins=20, color="#8b5cf6", edgecolor="white", alpha=0.7, label="Train")
axes[0].hist(X_test[:, 2], bins=20, color="#06b6d4", edgecolor="white", alpha=0.7, label="Test")
axes[0].set_title("Distribución de Age (normalizado)")
axes[0].legend()

axes[1].bar(["Train", "Test"], 
            [y_train.mean(), y_test.mean()], 
            color=["#8b5cf6", "#06b6d4"])
axes[1].set_title("Tasa de Supervivencia")
axes[1].set_ylabel("Proporción")

plt.tight_layout()
plt.show()
\`\`\`

---

## 🔍 Explicación línea por línea

- **\`df = titanic[columnas].copy()\`:** Selecciona solo columnas relevantes y crea copia independiente. No incluimos Name ni Ticket porque no son numéricamente útiles.
- **\`pd.get_dummies(df, columns=["Sex", "Embarked"], drop_first=True)\`:** Convierte categorías a columnas binarias (0/1). "Sex" se convierte en "Sex_male" (1=male, 0=female). \`drop_first=True\` elimina una categoría para evitar redundancia.
- **\`.values\` o \`.to_numpy()\`:** Convierte DataFrame/Serie a array de NumPy puro.
- **\`X.min(axis=0)\`:** Mínimo por columna (\`axis=0\`). Recuerda del Curso 1: axis=0 opera sobre filas (resultado por columna).
- **\`(X - X_min) / rango\`:** Normalización min-max. Cada feature queda entre 0 y 1. Esto es crucial porque la red neuronal trata igual a todos los números: sin normalizar, "Fare=512" dominaría sobre "Age=29".
- **\`np.random.permutation(len(X))\`:** Baraja los índices aleatoriamente para dividir sin sesgo.

---

## 📊 Visualización

\`\`\`
PIPELINE COMPLETO:

  DataFrame (891×12)
       ↓ Seleccionar columnas
  DataFrame (891×8)
       ↓ Limpiar faltantes
  DataFrame (891×8, sin NaN)
       ↓ Codificar categorías
  DataFrame (891×9, solo números)
       ↓ Separar X e y
  X: (891×8)  y: (891,)
       ↓ Normalizar X
  X_norm: (891×8, valores 0-1)
       ↓ Dividir train/test
  X_train: (712×8)   X_test: (179×8)
  y_train: (712,)    y_test: (179,)
       ↓
  ✅ model.fit(X_train, y_train)

ONE-HOT ENCODING:

  Sex          →    Sex_male
  "female"     →       0
  "male"       →       1

  Embarked     →    Embarked_Q  Embarked_S
  "C"          →       0           0
  "Q"          →       1           0
  "S"          →       0           1
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: ¿Por qué drop_first=True?
\`\`\`python
sin_drop = pd.get_dummies(df[["Sex"]], columns=["Sex"])
con_drop = pd.get_dummies(df[["Sex"]], columns=["Sex"], drop_first=True)
print("Sin drop_first:", list(sin_drop.columns))
print("Con drop_first:", list(con_drop.columns))
\`\`\`
> **Observa:** Sin drop_first obtienes Sex_female y Sex_male. Pero si Sex_male=0, ya sabes que es female. La columna extra es redundante.

### Experimento 2: Verificar que el split es representativo
\`\`\`python
print(f"Supervivencia total: {y.mean():.3f}")
print(f"Supervivencia train: {y_train.mean():.3f}")
print(f"Supervivencia test:  {y_test.mean():.3f}")
\`\`\`
> **Analiza:** ¿Las proporciones son similares? Si test tiene 90% supervivencia y train 30%, el split está sesgado.

---

## ⚠️ Errores comunes

**Error 1: Normalizar antes de dividir train/test**
\`\`\`python
# ❌ Data leakage: el test "ve" estadísticas del train
X_norm = (X - X.min(axis=0)) / (X.max(axis=0) - X.min(axis=0))
# Luego divides train/test → los min/max incluían datos de test

# ✅ En producción real: normaliza SOLO con estadísticas del train
# Para este curso introductorio lo simplificamos, pero recuérdalo
\`\`\`

**Error 2: Olvidar codificar categorías**
\`\`\`python
# ❌ ValueError en Keras: no puede convertir "male" a float
X = df[["Age", "Sex"]].values
model.fit(X, y)

# ✅ Primero codifica
df_encoded = pd.get_dummies(df, columns=["Sex"])
X = df_encoded.values
\`\`\`

**Error 3: Incluir el target en las features**
\`\`\`python
# ❌ El modelo "hace trampa" prediciendo con la respuesta
X = df_encoded.values  # Survived está dentro de X

# ✅ Separa correctamente
y = df_encoded["Survived"].values
X = df_encoded.drop(columns=["Survived"]).values
\`\`\`

---

## 🏆 Desafío

Aplica el pipeline completo al dataset \`"penguins"\` de Seaborn para predecir la especie. Pasos: limpiar faltantes, codificar categorías, separar X e y, normalizar, dividir 80/20.

<details>
<summary>Ver solución</summary>

\`\`\`python
import seaborn as sns
import pandas as pd
import numpy as np

penguins = sns.load_dataset("penguins").dropna().copy()
df = penguins[["species", "island", "bill_length_mm", "bill_depth_mm", 
               "flipper_length_mm", "body_mass_g", "sex"]]

df_encoded = pd.get_dummies(df, columns=["island", "sex"], drop_first=True)

# Codificar species como números (0, 1, 2)
species_map = {"Adelie": 0, "Chinstrap": 1, "Gentoo": 2}
y = df_encoded["species"].map(species_map).values
X = df_encoded.drop(columns=["species"]).values.astype(float)

X_min, X_max = X.min(axis=0), X.max(axis=0)
X_norm = (X - X_min) / (X_max - X_min)

np.random.seed(42)
idx = np.random.permutation(len(X_norm))
n = int(0.8 * len(X_norm))
X_train, X_test = X_norm[idx[:n]], X_norm[idx[n:]]
y_train, y_test = y[idx[:n]], y[idx[n:]]

print(f"X_train: {X_train.shape}, y_train: {y_train.shape}")
print(f"X_test: {X_test.shape}, y_test: {y_test.shape}")
print(f"Clases: {np.unique(y_train, return_counts=True)}")
\`\`\`
</details>

---

## 🧠 Autoevaluación

1. **¿Qué hace \`pd.get_dummies()\`?** → Convierte columnas categóricas en columnas binarias (0/1)
2. **¿Por qué normalizamos los datos?** → Para que todas las features tengan el mismo rango y ninguna domine
3. **¿Qué método convierte un DataFrame a array NumPy?** → \`.values\` o \`.to_numpy()\`

---

## 📖 Glosario

| Término | Definición |
|---------|-----------|
| **one-hot encoding** | Convertir categorías en columnas binarias (0/1) |
| **feature** | Variable de entrada para el modelo (columna de X) |
| **target** | Variable a predecir (y) |
| **normalization** | Escalar valores al rango 0-1 |
| **train/test split** | Dividir datos en conjunto de entrenamiento y prueba |
| **data leakage** | Cuando el modelo accede a información del test durante el entrenamiento |

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| \`pd.get_dummies()\` | One-hot encoding de categorías |
| \`drop_first=True\` | Elimina columna redundante |
| \`.values\` / \`.to_numpy()\` | DataFrame → NumPy array |
| \`(X-min)/(max-min)\` | Normalización min-max |
| \`np.random.permutation()\` | Barajar índices para split |

---

## ➡️ ¿Qué sigue y por qué?

Ya dominamos todo el pipeline: cargar → limpiar → explorar → visualizar → preparar para modelado. En la próxima lección pondremos todo junto en un **Proyecto Final**: un Análisis Exploratorio de Datos (EDA) completo sobre un dataset real, desde el archivo CSV hasta un reporte de hallazgos con gráficos.
`
  }
]
