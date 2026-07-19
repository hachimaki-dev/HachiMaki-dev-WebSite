// Part 4: Lesson 4 - Datos faltantes
export default [
  {
    title: "Datos Faltantes - Detectar, Entender y Decidir",
    excerpt: "Los datos del mundo real siempre tienen huecos. Aprende a detectar valores faltantes y decidir si eliminarlos o rellenarlos.",
    content: `# Lección 4: Datos Faltantes — Detectar, Entender y Decidir

## 🎯 Objetivo de aprendizaje

**Una sola idea:** Aprender a detectar valores faltantes (NaN) en un DataFrame, entender por qué faltan, y aplicar estrategias básicas para manejarlos (eliminar filas o imputar valores).

---

## Requisitos previos

- **Lecciones 0-3 de este curso:** Cargar CSV, usar \`.info()\`, \`.isnull().sum()\`, \`.describe()\`, acceder a columnas.
- **Curso 1, Lección 3:** NumPy y operaciones básicas.

## ⏱️ Tiempo estimado: 35 minutos

---

## ¿Por qué existe este concepto?

En la lección anterior descubrimos que el Titanic tiene 177 edades faltantes y 687 cabinas faltantes. Si intentas calcular el promedio de una columna con NaN, Pandas lo ignora silenciosamente. Si alimentas esos datos a un modelo de machine learning, puede fallar o dar resultados absurdos.

Los datos faltan por muchas razones: el sensor se desconectó, el paciente no respondió la pregunta, el formulario permitía dejar campos vacíos. Cada razón sugiere una estrategia diferente.

---

## Explicación intuitiva

Imagina una encuesta de satisfacción:
- **Pregunta 1:** ¿Tu nombre? → Todos responden.
- **Pregunta 7:** ¿Cuánto ganas? → Muchos la dejan en blanco (es sensible).

Si simplemente borras a todos los que no respondieron la pregunta 7, pierdes el 40% de tus respuestas. Si pones "0" donde falta, distorsionas los resultados. La solución depende del contexto:
- **Eliminar** si tienes muchos datos y pocos faltantes.
- **Rellenar (imputar)** con un valor razonable (promedio, mediana, o el valor más frecuente).

---

## Explicación técnica

**NaN** (Not a Number) es el marcador de dato faltante en Pandas. Viene de NumPy (\`np.nan\`).

Propiedades importantes de NaN:
- \`NaN != NaN\` → NaN no es igual a sí mismo (por diseño IEEE 754)
- Las operaciones con NaN dan NaN: \`5 + NaN = NaN\`
- \`.mean()\`, \`.sum()\` ignoran NaN por defecto

Estrategias principales:

| Estrategia | Método | ¿Cuándo? |
|-----------|--------|----------|
| Eliminar filas | \`df.dropna()\` | Pocos faltantes, muchos datos |
| Eliminar columnas | \`df.drop(columns=[...])\` | Columna con >50% faltantes |
| Rellenar con valor fijo | \`df.fillna(valor)\` | Valor por defecto lógico (ej: 0) |
| Rellenar con media | \`df.fillna(df.mean())\` | Columnas numéricas continuas |
| Rellenar con mediana | \`df.fillna(df.median())\` | Datos con outliers |
| Rellenar con moda | \`df.fillna(df.mode().iloc[0])\` | Columnas categóricas |

---

## 💻 Programa completo

\`\`\`python
# leccion_04_datos_faltantes.py
# Detectar y manejar valores faltantes en datos reales

import pandas as pd
import numpy as np

# Cargar el Titanic
url = "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv"
titanic = pd.read_csv(url)

# --- PASO 1: Detectar faltantes ---
print("=== PASO 1: DETECTAR FALTANTES ===")
print("Faltantes por columna:")
faltantes = titanic.isnull().sum()
print(faltantes[faltantes > 0])
print(f"\\nTotal de celdas: {titanic.shape[0] * titanic.shape[1]}")
print(f"Celdas faltantes: {titanic.isnull().sum().sum()}")
print(f"Porcentaje total: {titanic.isnull().mean().mean()*100:.1f}%")

# --- PASO 2: Visualizar el patrón de faltantes ---
print("\\n=== PASO 2: PATRÓN DE FALTANTES ===")
print("Porcentaje faltante por columna:")
pct_faltante = (titanic.isnull().mean() * 100).round(1)
print(pct_faltante[pct_faltante > 0].sort_values(ascending=False))

# --- PASO 3: Estrategia para Age (19.9% faltante) → Imputar ---
print("\\n=== PASO 3: IMPUTAR AGE ===")
print(f"Antes - Media: {titanic['Age'].mean():.1f}, Mediana: {titanic['Age'].median():.1f}")
print(f"Antes - Faltantes: {titanic['Age'].isnull().sum()}")

# Crear copia para no modificar el original
titanic_limpio = titanic.copy()
mediana_edad = titanic_limpio["Age"].median()
titanic_limpio["Age"] = titanic_limpio["Age"].fillna(mediana_edad)

print(f"\\nDespués - Faltantes: {titanic_limpio['Age'].isnull().sum()}")
print(f"Después - Media: {titanic_limpio['Age'].mean():.1f}, Mediana: {titanic_limpio['Age'].median():.1f}")

# --- PASO 4: Estrategia para Cabin (77.1% faltante) → Eliminar columna ---
print("\\n=== PASO 4: ELIMINAR CABIN ===")
print(f"Cabin tiene {titanic['Cabin'].isnull().mean()*100:.0f}% faltante → la eliminamos")
titanic_limpio = titanic_limpio.drop(columns=["Cabin"])
print(f"Columnas restantes: {list(titanic_limpio.columns)}")

# --- PASO 5: Estrategia para Embarked (0.2% faltante) → Eliminar filas ---
print("\\n=== PASO 5: ELIMINAR FILAS SIN EMBARKED ===")
print(f"Filas antes: {len(titanic_limpio)}")
titanic_limpio = titanic_limpio.dropna(subset=["Embarked"])
print(f"Filas después: {len(titanic_limpio)}")
print(f"Solo perdimos {891 - len(titanic_limpio)} filas (un costo aceptable)")

# --- PASO 6: Verificación final ---
print("\\n=== VERIFICACIÓN FINAL ===")
print("Faltantes restantes:")
print(titanic_limpio.isnull().sum().sum())
print("\\n✅ Dataset limpio y listo para análisis")
print(f"Forma final: {titanic_limpio.shape}")
\`\`\`

---

## 🔍 Explicación línea por línea

- **\`titanic.isnull().sum().sum()\`:** El primer \`.sum()\` cuenta faltantes por columna. El segundo \`.sum()\` suma todos esos conteos → total de celdas faltantes.
- **\`titanic.isnull().mean().mean()\`:** Proporción promedio de faltantes en todo el dataset.
- **\`titanic.copy()\`:** Crea una copia independiente. Sin esto, modificar \`titanic_limpio\` también modificaría \`titanic\` (ambos apuntarían a los mismos datos en memoria).
- **\`fillna(mediana_edad)\`:** Reemplaza cada NaN en la columna con el valor de la mediana. Los valores existentes no se tocan.
- **\`drop(columns=["Cabin"])\`:** Elimina la columna Cabin. Usamos \`columns=\` para ser explícitos (también existe \`axis=1\`, pero es menos legible).
- **\`dropna(subset=["Embarked"])\`:** Elimina solo las filas donde "Embarked" es NaN. Sin \`subset\`, eliminaría filas donde CUALQUIER columna tenga NaN.

---

## 📊 Visualización

\`\`\`
MAPA DE FALTANTES DEL TITANIC:

Columna        Faltantes    %      Estrategia
───────────────────────────────────────────────
Age            177         19.9%   → Imputar con mediana (28.0)
Cabin          687         77.1%   → Eliminar columna
Embarked         2          0.2%   → Eliminar 2 filas

DECISIÓN VISUAL:

  0%          25%          50%          75%         100%
  ├────────────┼────────────┼────────────┼────────────┤
  │ Embarked ▊ 0.2%  → eliminar filas (son solo 2)    │
  │ Age ██████ 19.9% → imputar (perderíamos mucho)    │
  │ Cabin ████████████████████████ 77.1% → eliminar col│
  └────────────────────────────────────────────────────┘

ANTES vs DESPUÉS:
  891 filas × 12 columnas  →  889 filas × 11 columnas
  866 celdas faltantes     →  0 celdas faltantes ✅
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: NaN es contagioso
\`\`\`python
print(5 + np.nan)
print(np.nan == np.nan)
print(pd.isna(np.nan))
\`\`\`
> **Predice:** ¿Qué da cada línea? ¿Por qué NaN no es igual a sí mismo?

### Experimento 2: Media vs Mediana para imputar
\`\`\`python
edades = titanic["Age"].copy()
con_media = edades.fillna(edades.mean())
con_mediana = edades.fillna(edades.median())
print(f"Original - std: {edades.std():.2f}")
print(f"Con media - std: {con_media.std():.2f}")
print(f"Con mediana - std: {con_mediana.std():.2f}")
\`\`\`
> **Observa:** ¿Cuál cambia menos la distribución original? La mediana es más robusta ante outliers.

### Experimento 3: dropna sin subset
\`\`\`python
print(f"Original: {len(titanic)} filas")
print(f"dropna(): {len(titanic.dropna())} filas")
print(f"dropna(subset=['Embarked']): {len(titanic.dropna(subset=['Embarked']))} filas")
\`\`\`
> **Observa:** \`dropna()\` sin argumentos es muy agresivo — elimina cualquier fila que tenga AL MENOS un NaN en cualquier columna.

---

## ⚠️ Errores comunes

**Error 1: Olvidar .copy() y modificar el original**
\`\`\`python
# ❌ SettingWithCopyWarning + modifica el original
df2 = titanic
df2["Age"] = df2["Age"].fillna(0)  # ¡También modifica titanic!

# ✅ Crear copia independiente
df2 = titanic.copy()
df2["Age"] = df2["Age"].fillna(0)
\`\`\`

**Error 2: Imputar antes de explorar**
\`\`\`python
# ❌ No hagas esto: rellenar todo con 0 sin pensar
titanic.fillna(0)  # ¿Edad 0? ¿Cabina "0"? No tiene sentido

# ✅ Primero entiende cada columna, luego decide por cada una
\`\`\`

**Error 3: fillna no modifica in-place por defecto**
\`\`\`python
# ❌ El resultado se pierde
titanic["Age"].fillna(28)
print(titanic["Age"].isnull().sum())  # ¡Sigue teniendo faltantes!

# ✅ Reasignar el resultado
titanic["Age"] = titanic["Age"].fillna(28)
\`\`\`

---

## 🏆 Desafío

Carga el dataset \`"penguins"\` de Seaborn. Diagnostica los faltantes y límpialos con esta estrategia:
1. Para columnas numéricas con faltantes: imputa con la mediana.
2. Para columnas categóricas con faltantes: imputa con la moda (valor más frecuente).
3. Verifica que no queden faltantes.

<details>
<summary>Ver solución</summary>

\`\`\`python
import seaborn as sns
import pandas as pd

penguins = sns.load_dataset("penguins").copy()
print("Antes:", penguins.isnull().sum().to_dict())

# Numéricas: imputar con mediana
for col in penguins.select_dtypes(include="number").columns:
    penguins[col] = penguins[col].fillna(penguins[col].median())

# Categóricas: imputar con moda
for col in penguins.select_dtypes(include="object").columns:
    penguins[col] = penguins[col].fillna(penguins[col].mode().iloc[0])

# Categorías de Seaborn (category dtype)
for col in penguins.select_dtypes(include="category").columns:
    penguins[col] = penguins[col].fillna(penguins[col].mode().iloc[0])

print("Después:", penguins.isnull().sum().sum(), "faltantes")
\`\`\`
</details>

---

## 🧠 Autoevaluación

1. **¿Qué valor usa Pandas para representar datos faltantes?** → \`NaN\` (Not a Number)
2. **¿Qué hace \`df.dropna(subset=["col"])\`?** → Elimina filas donde "col" tiene NaN
3. **¿Por qué usamos \`.copy()\` antes de modificar un DataFrame?** → Para no alterar el DataFrame original

---

## 📖 Glosario

| Término | Definición |
|---------|-----------|
| **NaN** | Not a Number: marcador de valor faltante |
| **isnull() / isna()** | Detecta valores faltantes (ambos son sinónimos) |
| **dropna()** | Elimina filas o columnas con valores faltantes |
| **fillna()** | Reemplaza NaN con un valor especificado |
| **imputar** | Rellenar valores faltantes con una estimación |
| **mediana** | Valor central cuando ordenas los datos (robusta ante outliers) |

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| \`df.isnull().sum()\` | Cuenta faltantes por columna |
| \`df.copy()\` | Copia independiente del DataFrame |
| \`df.fillna(valor)\` | Rellena NaN con un valor |
| \`df.dropna()\` | Elimina filas con NaN |
| \`df.dropna(subset=[...])\` | Elimina filas donde columnas específicas son NaN |
| \`df.drop(columns=[...])\` | Elimina columnas |

---

## ➡️ ¿Qué sigue y por qué?

Tenemos un dataset limpio, sin faltantes. Pero todavía no hemos seleccionado datos específicos. ¿Y si solo nos interesan los pasajeros mayores de 30 años? ¿O solo las mujeres de primera clase? En la próxima lección aprenderemos a **filtrar y seleccionar** datos con \`loc\`, \`iloc\` y condiciones booleanas — la herramienta más usada en análisis de datos.
`
  }
]
