// Part 8: Lesson 8 - Visualización con Matplotlib
export default [
  {
    title: "Visualización con Matplotlib - Histogramas, Dispersión y Líneas",
    excerpt: "Un gráfico dice más que mil filas. Aprende a crear histogramas, gráficos de dispersión y de líneas con Matplotlib.",
    content: `# Lección 8: Visualización con Matplotlib — Histogramas, Dispersión y Líneas

## 🎯 Objetivo de aprendizaje

**Una sola idea:** Aprender a crear los tres gráficos fundamentales (histograma, dispersión, líneas) con Matplotlib y personalizar sus elementos básicos.

---

## Requisitos previos

- **Lecciones 0-7 de este curso:** DataFrames, columnas, filtrado, groupby.
- **Lección 0:** Ya usamos \`plt.bar()\` y \`plt.show()\`.

## ⏱️ Tiempo estimado: 35 minutos

---

## ¿Por qué existe este concepto?

Puedes calcular que la edad promedio del Titanic es 29.7 años. Pero eso no te dice si la mayoría tiene ~30 o si hay bebés y ancianos con un promedio engañoso. Un histograma te muestra la **distribución real** en un vistazo.

"Si no puedes visualizarlo, no lo entiendes" — esa es la regla de la ciencia de datos.

---

## Explicación intuitiva

- **Histograma:** ¿Cómo se distribuye una variable? (ej: ¿la mayoría de pasajeros son jóvenes o viejos?)
- **Dispersión (scatter):** ¿Hay relación entre dos variables? (ej: ¿a mayor tarifa, mayor probabilidad de sobrevivir?)
- **Líneas:** ¿Cómo cambia algo a lo largo del tiempo? (ej: ¿el error de la red baja con las épocas?)

Cada tipo de gráfico responde una pregunta diferente.

---

## Explicación técnica

Matplotlib tiene dos niveles:
1. **pyplot (\`plt\`):** Interfaz rápida, estilo MATLAB. Ideal para gráficos simples.
2. **Figure + Axes:** Interfaz orientada a objetos. Para gráficos complejos con subplots.

Anatomía de un gráfico:

\`\`\`
Title (título)
┌────────────────────────────────────┐
│ Y-label  ▲                         │
│ (eje Y)  │    ●   ●                │
│          │  ●   ●    ●             │
│          │●       ●                │
│          └────────────────► X-label│
│                (eje X)             │
└────────────────────────────────────┘
             Legend (leyenda)
\`\`\`

---

## 💻 Programa completo

\`\`\`python
# leccion_08_matplotlib.py
# Los tres gráficos fundamentales

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

titanic = pd.read_csv("https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv")

# --- GRÁFICO 1: Histograma ---
print("=== HISTOGRAMA: DISTRIBUCIÓN DE EDADES ===")
plt.figure(figsize=(8, 4))
plt.hist(titanic["Age"].dropna(), bins=30, color="#8b5cf6", edgecolor="white", alpha=0.8)
plt.title("Distribución de Edades — Titanic", fontsize=14)
plt.xlabel("Edad")
plt.ylabel("Frecuencia")
plt.axvline(titanic["Age"].mean(), color="red", linestyle="--", label=f"Media: {titanic['Age'].mean():.1f}")
plt.axvline(titanic["Age"].median(), color="orange", linestyle="--", label=f"Mediana: {titanic['Age'].median():.1f}")
plt.legend()
plt.tight_layout()
plt.show()

# --- GRÁFICO 2: Dispersión (Scatter) ---
print("\\n=== DISPERSIÓN: EDAD vs TARIFA ===")
plt.figure(figsize=(8, 5))
colores = titanic["Survived"].map({0: "#ef4444", 1: "#22c55e"})
plt.scatter(titanic["Age"], titanic["Fare"], c=colores, alpha=0.5, s=20)
plt.title("Edad vs Tarifa — Coloreado por Supervivencia", fontsize=14)
plt.xlabel("Edad")
plt.ylabel("Tarifa (USD)")
plt.ylim(0, 300)

# Leyenda manual
import matplotlib.patches as mpatches
plt.legend(handles=[
    mpatches.Patch(color="#22c55e", label="Sobrevivió"),
    mpatches.Patch(color="#ef4444", label="No sobrevivió")
])
plt.tight_layout()
plt.show()

# --- GRÁFICO 3: Líneas ---
print("\\n=== LÍNEAS: SUPERVIVENCIA POR EDAD ===")
# Crear grupos de edad
titanic_limpio = titanic.dropna(subset=["Age"]).copy()
titanic_limpio["grupo_edad"] = pd.cut(titanic_limpio["Age"], bins=[0, 10, 20, 30, 40, 50, 60, 80])
supervivencia_edad = titanic_limpio.groupby("grupo_edad")["Survived"].mean()

plt.figure(figsize=(8, 4))
plt.plot(range(len(supervivencia_edad)), supervivencia_edad.values, 
         marker="o", color="#8b5cf6", linewidth=2, markersize=8)
plt.xticks(range(len(supervivencia_edad)), [str(x) for x in supervivencia_edad.index], rotation=45)
plt.title("Tasa de Supervivencia por Grupo de Edad", fontsize=14)
plt.xlabel("Grupo de Edad")
plt.ylabel("Tasa de Supervivencia")
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()

# --- GRÁFICO 4: Barras (repaso mejorado) ---
print("\\n=== BARRAS: PASAJEROS POR CLASE ===")
conteo = titanic["Pclass"].value_counts().sort_index()
colores_clase = ["#8b5cf6", "#06b6d4", "#f59e0b"]

plt.figure(figsize=(6, 4))
plt.bar(conteo.index.astype(str), conteo.values, color=colores_clase, edgecolor="white")
for i, v in enumerate(conteo.values):
    plt.text(i, v + 10, str(v), ha="center", fontweight="bold")
plt.title("Pasajeros por Clase", fontsize=14)
plt.xlabel("Clase")
plt.ylabel("Cantidad")
plt.tight_layout()
plt.show()

# --- GRÁFICO 5: Subplots (múltiples gráficos) ---
print("\\n=== SUBPLOTS: PANEL DE 2x2 ===")
fig, axes = plt.subplots(2, 2, figsize=(10, 8))

axes[0, 0].hist(titanic["Age"].dropna(), bins=20, color="#8b5cf6", edgecolor="white")
axes[0, 0].set_title("Distribución de Edad")

axes[0, 1].hist(titanic["Fare"], bins=20, color="#06b6d4", edgecolor="white")
axes[0, 1].set_title("Distribución de Tarifa")

surv = titanic.groupby("Pclass")["Survived"].mean()
axes[1, 0].bar(surv.index.astype(str), surv.values, color=colores_clase)
axes[1, 0].set_title("Supervivencia por Clase")

por_sexo = titanic.groupby("Sex")["Survived"].mean()
axes[1, 1].bar(por_sexo.index, por_sexo.values, color=["#f472b6", "#60a5fa"])
axes[1, 1].set_title("Supervivencia por Sexo")

fig.suptitle("Panel Exploratorio — Titanic", fontsize=16, fontweight="bold")
plt.tight_layout()
plt.show()
\`\`\`

---

## 🔍 Explicación línea por línea

- **\`plt.figure(figsize=(8, 4))\`:** Crea un lienzo de 8×4 pulgadas. Sin esto, Matplotlib usa un tamaño por defecto que suele ser muy pequeño.
- **\`plt.hist(..., bins=30)\`:** Histograma con 30 barras. Más bins = más detalle. \`alpha=0.8\` da transparencia.
- **\`dropna()\`:** Elimina NaN antes de graficar. Matplotlib no puede graficar NaN.
- **\`plt.axvline()\`:** Dibuja una línea vertical. Útil para marcar la media o mediana.
- **\`plt.scatter(x, y, c=colores)\`:** Gráfico de dispersión con colores personalizados por punto.
- **\`.map({0: "red", 1: "green"})\`:** Convierte valores numéricos a colores usando un diccionario.
- **\`pd.cut()\`:** Divide valores continuos en rangos discretos (0-10, 10-20, etc.).
- **\`plt.subplots(2, 2)\`:** Crea una cuadrícula de 2×2 gráficos. Devuelve \`fig\` (lienzo) y \`axes\` (array 2D de gráficos).
- **\`axes[0, 0].hist()\`:** Accedes a cada subplot por su posición en la cuadrícula.
- **\`plt.tight_layout()\`:** Ajusta automáticamente el espaciado para que no se superpongan.

---

## 📊 Visualización

\`\`\`
TIPOS DE GRÁFICO Y SU PREGUNTA:

  HISTOGRAMA              DISPERSIÓN             LÍNEAS
  ¿Cómo se distribuye?   ¿Hay relación?         ¿Cómo cambia?
  
  freq                     y ▲                   y ▲
  ▲  ██                      │  ●   ●              │    ●───●
  │  ██ ██                   │ ●  ●                 │   ╱     ╲
  │ ███ ██ ██                │●       ●             │  ●       ●───●
  │████ ██ ██ █              │  ●  ●                │ ╱
  └──────────────►          └─────────────►        └──────────────►
      valores                    x                     tiempo
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: Cambia la cantidad de bins
\`\`\`python
fig, axes = plt.subplots(1, 3, figsize=(12, 3))
for i, b in enumerate([5, 20, 50]):
    axes[i].hist(titanic["Age"].dropna(), bins=b, color="#8b5cf6", edgecolor="white")
    axes[i].set_title(f"bins={b}")
plt.tight_layout()
plt.show()
\`\`\`
> **Observa:** ¿Cuántos bins muestran la distribución más clara sin ser ruidosos?

### Experimento 2: Scatter sin límite en Y
\`\`\`python
plt.figure(figsize=(8, 5))
plt.scatter(titanic["Age"], titanic["Fare"], alpha=0.3, s=15)
plt.title("Sin límite en Y")
plt.show()
\`\`\`
> **Observa:** Un outlier (tarifa de $512) aplasta todo el gráfico. Por eso usamos \`plt.ylim(0, 300)\`.

---

## ⚠️ Errores comunes

**Error 1: Graficar con NaN**
\`\`\`python
# ❌ Matplotlib ignora NaN silenciosamente, distorsionando resultados
plt.hist(titanic["Age"])  # 177 valores no se grafican

# ✅ Sé explícito
plt.hist(titanic["Age"].dropna(), bins=30)
\`\`\`

**Error 2: Olvidar plt.show()**
\`\`\`python
# ❌ En scripts, el gráfico no se muestra sin show()
plt.hist(titanic["Age"].dropna())
# (nada aparece fuera de Colab/Jupyter)

# ✅
plt.hist(titanic["Age"].dropna())
plt.show()
\`\`\`

**Error 3: Gráficos encimados**
\`\`\`python
# ❌ El segundo gráfico se dibuja sobre el primero
plt.hist(titanic["Age"].dropna())
plt.scatter(titanic["Age"], titanic["Fare"])
plt.show()

# ✅ Crear figura nueva para cada gráfico
plt.figure()
plt.hist(titanic["Age"].dropna())
plt.show()

plt.figure()
plt.scatter(titanic["Age"], titanic["Fare"])
plt.show()
\`\`\`

---

## 🏆 Desafío

Crea un panel de 1×3 subplots que muestre: (1) histograma de tarifas, (2) barras de supervivencia por puerto de embarque, (3) dispersión de edad vs tarifa coloreada por clase.

<details>
<summary>Ver solución</summary>

\`\`\`python
import pandas as pd
import matplotlib.pyplot as plt

titanic = pd.read_csv("https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv")
fig, axes = plt.subplots(1, 3, figsize=(15, 4))

axes[0].hist(titanic["Fare"], bins=30, color="#8b5cf6", edgecolor="white")
axes[0].set_title("Distribución de Tarifas")
axes[0].set_xlim(0, 200)

surv_puerto = titanic.groupby("Embarked")["Survived"].mean()
axes[1].bar(surv_puerto.index, surv_puerto.values, color=["#ef4444", "#22c55e", "#3b82f6"])
axes[1].set_title("Supervivencia por Puerto")

colores_clase = titanic["Pclass"].map({1: "#8b5cf6", 2: "#06b6d4", 3: "#f59e0b"})
axes[2].scatter(titanic["Age"], titanic["Fare"], c=colores_clase, alpha=0.4, s=15)
axes[2].set_title("Edad vs Tarifa (por clase)")
axes[2].set_ylim(0, 300)

plt.tight_layout()
plt.show()
\`\`\`
</details>

---

## 🧠 Autoevaluación

1. **¿Qué gráfico usas para ver la distribución de una variable?** → Histograma
2. **¿Qué hace \`plt.subplots(2, 2)\`?** → Crea una cuadrícula de 4 gráficos (2×2)
3. **¿Por qué usamos \`dropna()\` antes de graficar?** → Porque Matplotlib no puede graficar NaN

---

## 📖 Glosario

| Término | Definición |
|---------|-----------|
| **histogram** | Gráfico de distribución: divide valores en bins y cuenta frecuencia |
| **scatter plot** | Gráfico de dispersión: un punto por cada observación (x, y) |
| **figure** | Lienzo completo que contiene uno o más gráficos |
| **axes** | Un gráfico individual dentro de una figure |
| **subplot** | Múltiples gráficos organizados en una cuadrícula |

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| \`plt.hist(datos, bins=N)\` | Histograma |
| \`plt.scatter(x, y)\` | Dispersión |
| \`plt.plot(x, y)\` | Líneas |
| \`plt.bar(x, y)\` | Barras |
| \`plt.subplots(f, c)\` | Cuadrícula de gráficos |
| \`plt.tight_layout()\` | Ajuste automático de espaciado |

---

## ➡️ ¿Qué sigue y por qué?

Matplotlib es poderoso pero a veces verboso. Para un histograma necesitas 5 líneas de código. En la próxima lección aprenderemos **Seaborn**, que crea gráficos estadísticos más sofisticados en una sola línea, con colores bonitos por defecto y funcionalidades como mostrar distribuciones por categoría automáticamente.
`
  }
]
