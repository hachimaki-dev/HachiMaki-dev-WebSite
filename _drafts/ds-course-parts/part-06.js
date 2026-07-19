// Part 6: Lesson 6 - Agrupar y resumir
export default [
  {
    title: "Agrupar y Resumir - groupby y Tablas Dinámicas",
    excerpt: "Transforma miles de filas en resúmenes útiles. groupby es la tabla dinámica de Excel, pero con superpoderes.",
    content: `# Lección 6: Agrupar y Resumir — groupby, Agregaciones y Tablas Dinámicas

## 🎯 Objetivo de aprendizaje

**Una sola idea:** Aprender a usar \`groupby()\` para dividir un dataset en grupos, aplicar funciones de agregación, y obtener resúmenes significativos.

---

## Requisitos previos

- **Lecciones 0-5 de este curso:** DataFrames, filtrado, \`.mean()\`, acceso a columnas, condiciones booleanas.

## ⏱️ Tiempo estimado: 35 minutos

---

## ¿Por qué existe este concepto?

En la lección anterior calculamos la supervivencia de mujeres vs hombres filtrando manualmente. Pero ¿y si queremos la supervivencia POR clase, POR puerto, POR sexo... todo a la vez? No vamos a escribir un filtro por cada combinación.

\`groupby\` responde automáticamente: "Para CADA valor de esta columna, calcula esta estadística."

---

## Explicación intuitiva

Imagina que tienes 891 boletas de supermercado en una pila. Tu jefe pregunta: "¿Cuánto gastó en promedio cada categoría de producto?"

Sin groupby: separas las boletas manualmente en pilas (frutas, lácteos, carnes...), calculas el promedio de cada pila, y anotas los resultados.

Con groupby: le dices a Pandas "agrupa por categoría y calcula el promedio" — una línea de código y listo.

El proceso se llama **Split-Apply-Combine** (dividir, aplicar, combinar).

---

## Explicación técnica

\`groupby\` funciona en tres pasos:

1. **Split:** Divide el DataFrame en grupos según una columna.
2. **Apply:** Aplica una función a cada grupo (mean, sum, count, etc.).
3. **Combine:** Junta los resultados en un nuevo DataFrame.

Funciones de agregación más usadas:

| Función | ¿Qué calcula? |
|---------|---------------|
| \`.mean()\` | Promedio |
| \`.median()\` | Mediana |
| \`.sum()\` | Suma total |
| \`.count()\` | Cantidad de valores no-nulos |
| \`.min()\` / \`.max()\` | Mínimo / Máximo |
| \`.std()\` | Desviación estándar |
| \`.agg([...])\` | Múltiples funciones a la vez |

---

## 💻 Programa completo

\`\`\`python
# leccion_06_groupby.py
# Agrupar datos para obtener resúmenes significativos

import pandas as pd

url = "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv"
titanic = pd.read_csv(url)

# --- PARTE 1: groupby básico ---
print("=== SUPERVIVENCIA POR SEXO ===")
por_sexo = titanic.groupby("Sex")["Survived"].mean()
print(por_sexo)
print(f"\\nLas mujeres sobrevivieron {por_sexo['female']/por_sexo['male']:.1f}x más que los hombres")

# --- PARTE 2: groupby con diferentes agregaciones ---
print("\\n=== ESTADÍSTICAS POR CLASE ===")
por_clase = titanic.groupby("Pclass").agg(
    supervivencia=("Survived", "mean"),
    edad_media=("Age", "mean"),
    tarifa_media=("Fare", "mean"),
    total_pasajeros=("PassengerId", "count")
)
print(por_clase.round(2))

# --- PARTE 3: groupby con múltiples columnas ---
print("\\n=== SUPERVIVENCIA POR SEXO Y CLASE ===")
por_sexo_clase = titanic.groupby(["Sex", "Pclass"])["Survived"].mean()
print(por_sexo_clase.round(3))

# --- PARTE 4: Contar valores ---
print("\\n=== CONTEO POR PUERTO DE EMBARQUE ===")
por_puerto = titanic.groupby("Embarked").agg(
    pasajeros=("PassengerId", "count"),
    supervivencia=("Survived", "mean"),
    tarifa_media=("Fare", "mean")
).round(2)
print(por_puerto)

# --- PARTE 5: Múltiples funciones con agg ---
print("\\n=== RESUMEN DE EDADES POR CLASE ===")
resumen_edad = titanic.groupby("Pclass")["Age"].agg(["mean", "median", "min", "max", "count"])
print(resumen_edad.round(1))

# --- PARTE 6: Tabla dinámica (pivot_table) ---
print("\\n=== TABLA DINÁMICA: SUPERVIVENCIA ===")
tabla = pd.pivot_table(
    titanic,
    values="Survived",
    index="Pclass",
    columns="Sex",
    aggfunc="mean"
)
print(tabla.round(3))
print("\\nLectura: el 96.8% de las mujeres de 1ra clase sobrevivieron.")
\`\`\`

---

## 🔍 Explicación línea por línea

- **\`titanic.groupby("Sex")["Survived"].mean()\`:** Agrupa por sexo → toma la columna Survived → calcula el promedio por grupo. Como Survived es 0/1, el promedio es la tasa de supervivencia.
- **\`.agg(supervivencia=("Survived", "mean"))\`:** Sintaxis con nombres personalizados. El resultado tendrá una columna llamada "supervivencia" que es la media de "Survived".
- **\`groupby(["Sex", "Pclass"])\`:** Agrupa por combinación de ambas columnas. Crea subgrupos: (female, 1), (female, 2), (female, 3), (male, 1), etc.
- **\`.agg(["mean", "median", "min", "max"])\`:** Aplica múltiples funciones a la vez sobre la misma columna.
- **\`pd.pivot_table(...)\`:** Crea una tabla cruzada. \`index\` va en filas, \`columns\` va en columnas, \`values\` es lo que se calcula, \`aggfunc\` es cómo.

---

## 📊 Visualización

\`\`\`
SPLIT - APPLY - COMBINE:

    SPLIT (agrupar por Sex)        APPLY (mean)     COMBINE
    ┌─────────────────────┐
    │ female:             │
    │  Survived: 1,1,0,1  │  ──►  mean = 0.74  ──┐
    │  ...                │                        │   Sex
    ├─────────────────────┤                        ├── female  0.742
    │ male:               │                        │   male    0.189
    │  Survived: 0,0,1,0  │  ──►  mean = 0.19  ──┘
    │  ...                │
    └─────────────────────┘

TABLA DINÁMICA:

Sex        female   male
Pclass
1          0.968    0.369    ← 1ra clase, mujeres: 96.8%
2          0.921    0.157
3          0.500    0.135    ← 3ra clase, hombres: 13.5%
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: ¿Qué tipo devuelve groupby?
\`\`\`python
grupo = titanic.groupby("Sex")
print(type(grupo))
print(type(grupo["Survived"].mean()))
\`\`\`
> **Observa:** \`groupby\` solo devuelve un objeto "agrupador". No calcula nada hasta que aplicas una función.

### Experimento 2: Ver los grupos
\`\`\`python
for nombre, grupo in titanic.groupby("Pclass"):
    print(f"Clase {nombre}: {len(grupo)} pasajeros, supervivencia: {grupo['Survived'].mean():.2f}")
\`\`\`
> **Observa:** Puedes iterar sobre los grupos. Cada iteración da el nombre del grupo y su DataFrame.

### Experimento 3: Ordenar resultados
\`\`\`python
por_puerto = titanic.groupby("Embarked")["Fare"].mean().sort_values(ascending=False)
print(por_puerto)
\`\`\`
> **Predice:** ¿Qué puerto tiene la tarifa promedio más alta?

---

## ⚠️ Errores comunes

**Error 1: Aplicar mean() a columnas de texto**
\`\`\`python
# ❌ Puede dar error o resultados inesperados
titanic.groupby("Sex").mean()  # Intenta promediar "Name" y "Ticket"

# ✅ Especifica la columna numérica
titanic.groupby("Sex")["Survived"].mean()

# ✅ O selecciona solo numéricas
titanic.groupby("Sex")[["Survived", "Age", "Fare"]].mean()
\`\`\`

**Error 2: Confundir count con size**
\`\`\`python
# count() ignora NaN
print(titanic.groupby("Pclass")["Age"].count())  # No cuenta los NaN

# size() cuenta todo (incluye NaN)
print(titanic.groupby("Pclass").size())
\`\`\`

**Error 3: No resetear el índice**
\`\`\`python
# El resultado de groupby tiene un índice especial
resultado = titanic.groupby("Sex")["Survived"].mean()
print(type(resultado))  # Serie con Sex como índice

# Si necesitas un DataFrame normal:
resultado_df = resultado.reset_index()
print(type(resultado_df))  # DataFrame normal
\`\`\`

---

## 🏆 Desafío

Con el Titanic, crea una tabla que muestre para cada combinación de clase y puerto de embarque: el número de pasajeros, la tasa de supervivencia y la tarifa promedio. ¿Cuál fue el grupo más afortunado?

<details>
<summary>Ver solución</summary>

\`\`\`python
import pandas as pd
url = "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv"
titanic = pd.read_csv(url)

resumen = titanic.groupby(["Pclass", "Embarked"]).agg(
    pasajeros=("PassengerId", "count"),
    supervivencia=("Survived", "mean"),
    tarifa_media=("Fare", "mean")
).round(2)
print(resumen)
print(f"\\nGrupo más afortunado: {resumen['supervivencia'].idxmax()}")
print(f"Tasa: {resumen['supervivencia'].max():.0%}")
\`\`\`
</details>

---

## 🧠 Autoevaluación

1. **¿Cuáles son los 3 pasos de groupby?** → Split, Apply, Combine
2. **¿Cómo aplicas múltiples funciones a la vez?** → \`.agg(["mean", "sum", "count"])\`
3. **¿Qué diferencia hay entre \`count()\` y \`size()\`?** → count ignora NaN, size cuenta todo

---

## 📖 Glosario

| Término | Definición |
|---------|-----------|
| **groupby** | Agrupar filas por los valores de una o más columnas |
| **aggregation** | Función que reduce un grupo a un solo valor (mean, sum, count) |
| **pivot_table** | Tabla cruzada con filas, columnas y valores agregados |
| **Split-Apply-Combine** | Patrón: dividir en grupos, aplicar función, combinar resultados |

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| \`df.groupby("col")\` | Agrupa por columna |
| \`grupo["col"].mean()\` | Promedio por grupo |
| \`.agg(nombre=("col", "func"))\` | Agregación con nombre |
| \`.agg(["func1", "func2"])\` | Múltiples funciones |
| \`pd.pivot_table()\` | Tabla dinámica cruzada |
| \`.reset_index()\` | Convierte índice agrupado a columna |

---

## ➡️ ¿Qué sigue y por qué?

Hasta ahora hemos trabajado con un solo dataset. Pero en el mundo real, los datos suelen estar repartidos en múltiples tablas (clientes en una, pedidos en otra, productos en otra). En la próxima lección aprenderemos a **combinar datasets** usando merge, join y concat — el equivalente al VLOOKUP de Excel.
`
  }
]
