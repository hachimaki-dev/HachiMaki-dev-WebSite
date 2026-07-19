// Part 9: Lesson 9 - Visualización con Seaborn
export default [
  {
    title: "Visualización con Seaborn - Correlaciones y Distribuciones",
    excerpt: "Seaborn convierte análisis estadísticos complejos en gráficos de una línea. Aprende heatmaps, boxplots y pairplots.",
    content: `# Lección 9: Visualización con Seaborn — Correlaciones y Distribuciones por Categoría

## 🎯 Objetivo de aprendizaje

**Una sola idea:** Aprender a usar Seaborn para crear gráficos estadísticos avanzados (heatmap de correlaciones, boxplot, violin plot, pairplot) con una sola línea de código.

---

## Requisitos previos

- **Lecciones 0-8 de este curso:** DataFrames, groupby, Matplotlib básico, \`plt.figure()\`, \`plt.show()\`.
- **Lección 0:** Ya usamos \`sns.load_dataset()\`.

## ⏱️ Tiempo estimado: 35 minutos

---

## ¿Por qué existe este concepto?

Con Matplotlib puedes hacer cualquier gráfico, pero para análisis estadístico necesitas mucho código. ¿Quieres ver cómo se distribuye la tarifa POR clase Y POR sexo? En Matplotlib son 20+ líneas. En Seaborn es una:

\`sns.boxplot(data=titanic, x="Pclass", y="Fare", hue="Sex")\`

Seaborn está construido sobre Matplotlib. No lo reemplaza, lo complementa.

---

## Explicación intuitiva

Si Matplotlib es una caja de herramientas completa (martillo, destornillador, sierra...), Seaborn es una herramienta eléctrica: hace tareas comunes mucho más rápido, con mejor acabado, pero no sirve para todo.

---

## Explicación técnica

| Gráfico Seaborn | ¿Qué muestra? | ¿Cuándo usarlo? |
|-----------------|---------------|-----------------|
| \`sns.histplot()\` | Distribución | Reemplaza \`plt.hist\` con más opciones |
| \`sns.boxplot()\` | Resumen estadístico por categoría | Detectar outliers y comparar grupos |
| \`sns.violinplot()\` | Distribución + densidad por categoría | Como boxplot pero más detallado |
| \`sns.heatmap()\` | Matriz de colores | Correlaciones entre variables |
| \`sns.pairplot()\` | Scatter de todas las combinaciones | Vista panorámica de relaciones |
| \`sns.countplot()\` | Conteo de categorías | Reemplaza \`value_counts().plot.bar()\` |

El parámetro \`hue\` es la magia de Seaborn: colorea automáticamente por una variable categórica.

---

## 💻 Programa completo

\`\`\`python
# leccion_09_seaborn.py
# Gráficos estadísticos avanzados con Seaborn

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

titanic = pd.read_csv("https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv")

# --- GRÁFICO 1: Boxplot ---
print("=== BOXPLOT: TARIFA POR CLASE ===")
plt.figure(figsize=(8, 5))
sns.boxplot(data=titanic, x="Pclass", y="Fare", hue="Survived", palette="viridis")
plt.title("Distribución de Tarifas por Clase y Supervivencia")
plt.ylim(0, 200)
plt.show()

# --- GRÁFICO 2: Heatmap de correlaciones ---
print("\\n=== HEATMAP: CORRELACIONES ===")
columnas_num = ["Survived", "Pclass", "Age", "SibSp", "Parch", "Fare"]
correlacion = titanic[columnas_num].corr()
print("Matriz de correlación:")
print(correlacion.round(2))

plt.figure(figsize=(8, 6))
sns.heatmap(correlacion, annot=True, fmt=".2f", cmap="coolwarm", center=0,
            square=True, linewidths=1)
plt.title("Mapa de Correlaciones — Titanic")
plt.tight_layout()
plt.show()

# --- GRÁFICO 3: Violin plot ---
print("\\n=== VIOLIN PLOT: EDAD POR CLASE ===")
plt.figure(figsize=(8, 5))
sns.violinplot(data=titanic, x="Pclass", y="Age", hue="Sex", split=True, 
               palette={"male": "#60a5fa", "female": "#f472b6"})
plt.title("Distribución de Edad por Clase y Sexo")
plt.show()

# --- GRÁFICO 4: Countplot ---
print("\\n=== COUNTPLOT: PASAJEROS POR CLASE Y SEXO ===")
plt.figure(figsize=(7, 4))
sns.countplot(data=titanic, x="Pclass", hue="Sex", palette={"male": "#60a5fa", "female": "#f472b6"})
plt.title("Cantidad de Pasajeros por Clase y Sexo")
plt.show()

# --- GRÁFICO 5: Pairplot (panorámica) ---
print("\\n=== PAIRPLOT: VISTA PANORÁMICA ===")
# Usamos solo unas columnas para que no tarde demasiado
subset = titanic[["Survived", "Age", "Fare", "Pclass"]].dropna()
sns.pairplot(subset, hue="Survived", palette={0: "#ef4444", 1: "#22c55e"},
             diag_kind="hist", plot_kws={"alpha": 0.4, "s": 15})
plt.suptitle("Pairplot — Titanic", y=1.02)
plt.show()

# --- GRÁFICO 6: Histograma mejorado con KDE ---
print("\\n=== HISTPLOT CON KDE ===")
plt.figure(figsize=(8, 4))
sns.histplot(data=titanic, x="Age", hue="Survived", kde=True, bins=30,
             palette={0: "#ef4444", 1: "#22c55e"}, alpha=0.5)
plt.title("Distribución de Edad por Supervivencia")
plt.show()
\`\`\`

---

## 🔍 Explicación línea por línea

- **\`sns.boxplot(data=titanic, x="Pclass", y="Fare", hue="Survived")\`:** Boxplot con clase en X, tarifa en Y, coloreado por supervivencia. La caja muestra Q1, mediana, Q3. Los bigotes se extienden hasta 1.5×IQR. Los puntos más allá son outliers.
- **\`titanic[columnas_num].corr()\`:** Calcula la correlación de Pearson entre todas las columnas numéricas. Va de -1 (inversamente proporcional) a +1 (directamente proporcional). 0 = sin relación lineal.
- **\`sns.heatmap(correlacion, annot=True, fmt=".2f")\`:** Mapa de calor con números encima (\`annot=True\`) formateados a 2 decimales (\`fmt=".2f"\`). \`center=0\` pone el blanco en correlación 0.
- **\`sns.violinplot(..., split=True)\`:** Violin plot dividido: cada mitad del violín muestra un grupo de \`hue\`. Muestra la distribución completa (no solo la caja).
- **\`sns.pairplot()\`:** Crea una matriz de scatter plots para cada par de variables. La diagonal muestra histogramas. Es la forma más rápida de ver todas las relaciones.
- **\`kde=True\`:** Agrega una curva de densidad suavizada (Kernel Density Estimation) sobre el histograma.

---

## 📊 Visualización

\`\`\`
LECTURA DE UN BOXPLOT:

                    outliers (puntos individuales)
                        ●    ●
            ┬───────────────────┬  ← máximo (sin outliers)
            │                   │
    Q3 ──── ┤▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓├  ← 75% de los datos están debajo
            │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
  mediana ──┤───────────────────├  ← valor del medio (50%)
            │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
    Q1 ──── ┤▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓├  ← 25% de los datos están debajo
            │                   │
            ┴───────────────────┴  ← mínimo (sin outliers)

CORRELACIÓN:
  +1.0  → perfecta positiva (A sube, B sube)
   0.0  → sin relación lineal
  -1.0  → perfecta negativa (A sube, B baja)

  Ejemplo: Pclass y Fare = -0.55 (a mayor clase numérica, menor tarifa)
  Lógico: Clase 1 = cara, Clase 3 = barata
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: Interpreta la correlación
\`\`\`python
print(correlacion["Survived"].sort_values(ascending=False))
\`\`\`
> **Analiza:** ¿Qué variable tiene la correlación más fuerte con Survived? ¿Es positiva o negativa? ¿Tiene sentido?

### Experimento 2: Paletas de colores
\`\`\`python
fig, axes = plt.subplots(1, 3, figsize=(15, 4))
for i, pal in enumerate(["viridis", "coolwarm", "Set2"]):
    sns.boxplot(data=titanic, x="Pclass", y="Age", palette=pal, ax=axes[i])
    axes[i].set_title(f"Paleta: {pal}")
plt.tight_layout()
plt.show()
\`\`\`
> **Observa:** Las paletas cambian la legibilidad. \`viridis\` es la más accesible para daltonismo.

### Experimento 3: Dataset penguins
\`\`\`python
penguins = sns.load_dataset("penguins").dropna()
sns.pairplot(penguins, hue="species", palette="viridis")
plt.show()
\`\`\`
> **Analiza:** ¿Qué par de variables separa mejor las tres especies?

---

## ⚠️ Errores comunes

**Error 1: No dropna antes de correlaciones**
\`\`\`python
# Los NaN se excluyen automáticamente en .corr(), pero en pairplot pueden causar warnings
# ✅ Siempre filtra primero
subset = titanic[columnas].dropna()
\`\`\`

**Error 2: Interpretar correlación como causalidad**
\`\`\`python
# Fare y Survived tienen correlación positiva (0.26)
# ¿Pagar más te salva? NO necesariamente.
# Los ricos viajaban en 1ra clase, que tenía botes salvavidas más cerca.
# Correlación ≠ Causalidad
\`\`\`

**Error 3: Pairplot con demasiadas columnas**
\`\`\`python
# ❌ Con 10 columnas = 100 gráficos = muy lento
sns.pairplot(titanic)

# ✅ Selecciona 3-5 columnas relevantes
sns.pairplot(titanic[["Age", "Fare", "Survived"]].dropna())
\`\`\`

---

## 🏆 Desafío

Con el dataset \`"tips"\` de Seaborn, crea: (1) un boxplot de \`total_bill\` por \`day\` coloreado por \`time\`, (2) un heatmap de correlaciones, (3) un violin plot de \`tip\` por \`day\`.

<details>
<summary>Ver solución</summary>

\`\`\`python
import seaborn as sns
import matplotlib.pyplot as plt

tips = sns.load_dataset("tips")

fig, axes = plt.subplots(1, 3, figsize=(16, 5))

sns.boxplot(data=tips, x="day", y="total_bill", hue="time", ax=axes[0])
axes[0].set_title("Cuenta por Día y Momento")

corr = tips[["total_bill", "tip", "size"]].corr()
sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", ax=axes[1])
axes[1].set_title("Correlaciones")

sns.violinplot(data=tips, x="day", y="tip", palette="viridis", ax=axes[2])
axes[2].set_title("Distribución de Propina por Día")

plt.tight_layout()
plt.show()
\`\`\`
</details>

---

## 🧠 Autoevaluación

1. **¿Qué gráfico usas para ver correlaciones entre variables numéricas?** → Heatmap (\`sns.heatmap(df.corr())\`)
2. **¿Qué hace el parámetro \`hue\` en Seaborn?** → Colorea los datos por una variable categórica
3. **¿Qué muestra un boxplot que un histograma no?** → Outliers como puntos individuales, cuartiles y mediana

---

## 📖 Glosario

| Término | Definición |
|---------|-----------|
| **correlation** | Medida de relación lineal entre dos variables (-1 a +1) |
| **heatmap** | Mapa de calor: matriz coloreada por intensidad de valores |
| **boxplot** | Gráfico de caja: muestra mediana, cuartiles y outliers |
| **violin plot** | Boxplot + distribución de densidad |
| **pairplot** | Matriz de scatter plots entre todos los pares de variables |
| **KDE** | Kernel Density Estimation: curva suavizada de distribución |
| **hue** | Parámetro que colorea por categoría |

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| \`sns.boxplot(data, x, y, hue)\` | Caja por categoría |
| \`sns.heatmap(df.corr())\` | Mapa de correlaciones |
| \`sns.violinplot()\` | Distribución por categoría |
| \`sns.pairplot()\` | Panorámica de relaciones |
| \`sns.histplot(kde=True)\` | Histograma con densidad |
| \`sns.countplot()\` | Conteo de categorías |

---

## ➡️ ¿Qué sigue y por qué?

Ya dominamos visualización. Pero nuestros gráficos revelaron algo preocupante: puntos que se alejan mucho del resto (una tarifa de $512 cuando el promedio es $32). En la próxima lección aprenderemos a **detectar outliers y datos sospechosos** — valores que pueden ser errores de captura o casos genuinamente extremos.
`
  }
]
