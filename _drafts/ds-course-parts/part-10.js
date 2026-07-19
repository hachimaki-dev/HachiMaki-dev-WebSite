// Part 10: Lesson 10 - Detectar outliers
export default [
  {
    title: "Detectar Outliers y Datos Sospechosos",
    excerpt: "No todo dato extremo es un error, pero todo error extremo contamina tu análisis. Aprende a detectar y decidir qué hacer con outliers.",
    content: `# Lección 10: Detectar Outliers y Datos Sospechosos

## 🎯 Objetivo de aprendizaje

**Una sola idea:** Aprender a detectar valores extremos (outliers) usando métodos estadísticos (IQR) y visuales (boxplot), y decidir si eliminarlos, transformarlos o conservarlos.

---

## Requisitos previos

- **Lecciones 0-9 de este curso:** DataFrames, filtrado booleano, \`.describe()\`, Matplotlib, Seaborn boxplot.

## ⏱️ Tiempo estimado: 30 minutos

---

## ¿Por qué existe este concepto?

En el Titanic hay una tarifa de $512 cuando el promedio es $32. ¿Es un error? No — es un camarote de lujo real. Pero si calculas el promedio con ese valor, distorsiona el resultado.

En otros datasets, un "99999" en la columna de edad sí es un error de captura. Distinguir outliers legítimos de errores es una habilidad crítica que determina la calidad de tu análisis.

---

## Explicación intuitiva

Imagina que mides la estatura de tu clase: la mayoría mide entre 1.55m y 1.85m. Si aparece alguien de 2.20m, es un outlier legítimo (una persona muy alta). Si aparece alguien de 15.5m, es un error de captura (alguien escribió centímetros en el campo de metros).

El truco es: no eliminar automáticamente, sino investigar.

---

## Explicación técnica

**Método IQR (Rango Intercuartílico):**

1. Calcula Q1 (percentil 25) y Q3 (percentil 75)
2. IQR = Q3 - Q1
3. Límite inferior = Q1 - 1.5 × IQR
4. Límite superior = Q3 + 1.5 × IQR
5. Todo valor fuera de estos límites es un outlier

Este es exactamente el criterio que usa el boxplot de Seaborn para dibujar los bigotes y los puntos.

**Método Z-score:** ¿A cuántas desviaciones estándar está del promedio? Si |z| > 3, es sospechoso.

---

## 💻 Programa completo

\`\`\`python
# leccion_10_outliers.py
# Detectar y manejar valores extremos

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

titanic = pd.read_csv("https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv")

# --- PARTE 1: Detectar con describe ---
print("=== PASO 1: ESTADÍSTICAS SOSPECHOSAS ===")
print(titanic[["Age", "Fare", "SibSp", "Parch"]].describe().round(2))
print("\\n¿Ves algo raro?")
print(f"  Fare max: \${titanic['Fare'].max():.2f} vs media: \${titanic['Fare'].mean():.2f}")
print(f"  SibSp max: {titanic['SibSp'].max()} hermanos/esposos")

# --- PARTE 2: Método IQR ---
print("\\n=== PASO 2: MÉTODO IQR PARA FARE ===")
Q1 = titanic["Fare"].quantile(0.25)
Q3 = titanic["Fare"].quantile(0.75)
IQR = Q3 - Q1
limite_inf = Q1 - 1.5 * IQR
limite_sup = Q3 + 1.5 * IQR

print(f"Q1: {Q1:.2f}")
print(f"Q3: {Q3:.2f}")
print(f"IQR: {IQR:.2f}")
print(f"Límite inferior: {limite_inf:.2f}")
print(f"Límite superior: {limite_sup:.2f}")

outliers_fare = titanic[(titanic["Fare"] < limite_inf) | (titanic["Fare"] > limite_sup)]
print(f"\\nOutliers detectados: {len(outliers_fare)} de {len(titanic)} ({len(outliers_fare)/len(titanic)*100:.1f}%)")
print(f"Rango de outliers: \${outliers_fare['Fare'].min():.2f} - \${outliers_fare['Fare'].max():.2f}")

# --- PARTE 3: Visualizar outliers ---
print("\\n=== PASO 3: VISUALIZACIÓN ===")
fig, axes = plt.subplots(1, 3, figsize=(15, 4))

# Boxplot
sns.boxplot(data=titanic, y="Fare", ax=axes[0], color="#8b5cf6")
axes[0].set_title("Boxplot de Tarifa")
axes[0].set_ylim(-10, 300)

# Histograma con límites IQR
axes[1].hist(titanic["Fare"], bins=50, color="#8b5cf6", edgecolor="white", alpha=0.7)
axes[1].axvline(limite_sup, color="red", linestyle="--", label=f"Límite IQR: {limite_sup:.0f}")
axes[1].set_title("Histograma con Límite IQR")
axes[1].set_xlim(0, 300)
axes[1].legend()

# Scatter: ¿los outliers son de alguna clase?
colores = titanic["Pclass"].map({1: "#8b5cf6", 2: "#06b6d4", 3: "#f59e0b"})
axes[2].scatter(titanic.index, titanic["Fare"], c=colores, alpha=0.5, s=10)
axes[2].axhline(limite_sup, color="red", linestyle="--")
axes[2].set_title("Tarifas por Pasajero (color=clase)")
axes[2].set_ylabel("Tarifa")
axes[2].set_ylim(0, 300)

plt.tight_layout()
plt.show()

# --- PARTE 4: ¿Eliminar o conservar? ---
print("\\n=== PASO 4: ANÁLISIS DE OUTLIERS ===")
print("¿De qué clase son los outliers de Fare?")
print(outliers_fare["Pclass"].value_counts())
print("\\nSon casi todos de 1ra clase → son tarifas legítimas de lujo.")
print("Decisión: CONSERVAR pero usar MEDIANA en vez de MEDIA para resúmenes.")

# --- PARTE 5: Función reutilizable ---
print("\\n=== PASO 5: FUNCIÓN PARA DETECTAR OUTLIERS ===")
def detectar_outliers_iqr(serie):
    """Detecta outliers usando el método IQR."""
    Q1 = serie.quantile(0.25)
    Q3 = serie.quantile(0.75)
    IQR = Q3 - Q1
    mask = (serie < Q1 - 1.5 * IQR) | (serie > Q3 + 1.5 * IQR)
    return mask

# Aplicar a todas las columnas numéricas
for col in ["Age", "Fare", "SibSp", "Parch"]:
    datos = titanic[col].dropna()
    n_outliers = detectar_outliers_iqr(datos).sum()
    print(f"  {col}: {n_outliers} outliers ({n_outliers/len(datos)*100:.1f}%)")

# --- PARTE 6: Impacto en estadísticas ---
print("\\n=== PASO 6: IMPACTO DE OUTLIERS ===")
fare = titanic["Fare"]
fare_sin = fare[~detectar_outliers_iqr(fare)]
print(f"Con outliers  → Media: {fare.mean():.2f}, Mediana: {fare.median():.2f}")
print(f"Sin outliers  → Media: {fare_sin.mean():.2f}, Mediana: {fare_sin.median():.2f}")
print(f"La media cambia {abs(fare.mean()-fare_sin.mean()):.2f}, la mediana solo {abs(fare.median()-fare_sin.median()):.2f}")
\`\`\`

---

## 🔍 Explicación línea por línea

- **\`.quantile(0.25)\`:** Calcula el percentil 25 (Q1). El 25% de los datos está por debajo de este valor.
- **\`IQR = Q3 - Q1\`:** Rango intercuartílico. Mide la dispersión del 50% central de los datos.
- **\`Q1 - 1.5 * IQR\`:** Límite inferior para outliers. El factor 1.5 es una convención estadística estándar.
- **\`(serie < lim_inf) | (serie > lim_sup)\`:** Máscara booleana que es True para valores extremos. Combina con OR (\`|\`).
- **\`plt.axhline()\`:** Línea horizontal (h = horizontal). Marca visualmente el límite de outliers.
- **\`def detectar_outliers_iqr(serie)\`:** Función reutilizable. Recuerda del Curso 1: las funciones empaquetan lógica para no repetir código.

---

## 📊 Visualización

\`\`\`
MÉTODO IQR VISUAL:

  Datos ordenados de menor a mayor:
  
  ◄─── outliers ───►│◄──── rango normal ────►│◄─── outliers ───►
                     │                        │
  ●  ●               Q1          Q3           
  │                  │     IQR    │            │
  └──────────────────┤───────────├────────────┘
                     │           │
               Q1-1.5×IQR    Q3+1.5×IQR

  Para Fare del Titanic:
  Q1 = $7.91  │  Q3 = $31.00  │  IQR = $23.09
  Límite sup = $31.00 + 1.5 × $23.09 = $65.63
  Todo lo que supere $65.63 es un outlier por IQR.
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: ¿Cuántos outliers por columna?
\`\`\`python
penguins = sns.load_dataset("penguins").dropna()
for col in penguins.select_dtypes(include="number").columns:
    n = detectar_outliers_iqr(penguins[col]).sum()
    print(f"{col}: {n} outliers")
\`\`\`
> **Observa:** ¿Qué variable de los pingüinos tiene más outliers?

### Experimento 2: Media vs Mediana con outliers
\`\`\`python
datos_normales = [10, 12, 11, 13, 10, 12, 11]
datos_con_outlier = [10, 12, 11, 13, 10, 12, 1000]
print(f"Sin outlier → Media: {np.mean(datos_normales):.1f}, Mediana: {np.median(datos_normales):.1f}")
print(f"Con outlier → Media: {np.mean(datos_con_outlier):.1f}, Mediana: {np.median(datos_con_outlier):.1f}")
\`\`\`
> **Observa:** Un solo outlier mueve la media de ~11 a ~152. La mediana apenas cambia. Por eso usamos mediana con datos sucios.

---

## ⚠️ Errores comunes

**Error 1: Eliminar outliers automáticamente**
\`\`\`python
# ❌ Nunca elimines sin investigar
df = df[~detectar_outliers_iqr(df["Fare"])]  # ¿Estás seguro?

# ✅ Primero investiga: ¿son errores o datos reales?
print(outliers_fare[["Name", "Pclass", "Fare"]])  # Ah, son suites de lujo
\`\`\`

**Error 2: Usar IQR con distribuciones no simétricas**
\`\`\`python
# IQR funciona mejor con distribuciones simétricas
# Para datos muy sesgados (como Fare), muchos "outliers" son valores normales altos
# Siempre visualiza primero con histograma
\`\`\`

**Error 3: Aplicar IQR a columnas categóricas codificadas**
\`\`\`python
# ❌ SibSp tiene valores 0-8 → detectar "outliers" de familias grandes no tiene sentido
# IQR es para variables continuas (edad, peso, precio)
\`\`\`

---

## 🏆 Desafío

Carga el dataset \`"diamonds"\` de Seaborn. Detecta outliers en la columna \`"price"\` usando IQR. Luego compara la media y mediana con y sin outliers, y crea un boxplot que muestre la distribución.

<details>
<summary>Ver solución</summary>

\`\`\`python
import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd

diamonds = sns.load_dataset("diamonds")
price = diamonds["price"]

Q1 = price.quantile(0.25)
Q3 = price.quantile(0.75)
IQR = Q3 - Q1
mask = (price < Q1 - 1.5*IQR) | (price > Q3 + 1.5*IQR)

print(f"Outliers: {mask.sum()} de {len(price)} ({mask.mean()*100:.1f}%)")
print(f"Con outliers  → Media: \${price.mean():.0f}, Mediana: \${price.median():.0f}")
print(f"Sin outliers  → Media: \${price[~mask].mean():.0f}, Mediana: \${price[~mask].median():.0f}")

plt.figure(figsize=(8, 4))
sns.boxplot(data=diamonds, y="price", color="#8b5cf6")
plt.title("Distribución de Precios de Diamantes")
plt.show()
\`\`\`
</details>

---

## 🧠 Autoevaluación

1. **¿Qué es IQR?** → Q3 - Q1: el rango del 50% central de los datos
2. **¿Qué límite marca un outlier con IQR?** → Valores fuera de Q1-1.5×IQR o Q3+1.5×IQR
3. **¿Por qué la mediana es mejor que la media con outliers?** → La mediana no se afecta por valores extremos

---

## 📖 Glosario

| Término | Definición |
|---------|-----------|
| **outlier** | Valor extremo que se aleja significativamente del resto |
| **IQR** | Interquartile Range: rango entre Q1 y Q3 |
| **Q1 / Q3** | Primer y tercer cuartil (percentiles 25 y 75) |
| **z-score** | Cuántas desviaciones estándar un valor dista de la media |
| **robusto** | Método estadístico que no se afecta por outliers (ej: mediana) |

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| \`.quantile(0.25)\` | Primer cuartil (Q1) |
| \`IQR = Q3 - Q1\` | Rango intercuartílico |
| \`Q1-1.5×IQR, Q3+1.5×IQR\` | Límites de outliers |
| \`sns.boxplot()\` | Muestra outliers visualmente |
| Mediana > Media | Más robusta ante outliers |

---

## ➡️ ¿Qué sigue y por qué?

Hemos explorado, limpiado y visualizado datos como científicos de datos. Pero recordemos de dónde venimos: el Curso 1 terminó con redes neuronales que recibían arrays de NumPy. ¿Cómo pasamos de un DataFrame de Pandas a un array listo para alimentar un modelo? En la próxima lección construiremos **el puente entre Pandas y NumPy** — el paso final antes del modelado.
`
  }
]
