// Part 5: Lesson 5 - Filtrar y seleccionar
export default [
  {
    title: "Filtrar y Seleccionar - loc, iloc y Condiciones Booleanas",
    excerpt: "Aprende a extraer exactamente los datos que necesitas: filas específicas, columnas específicas, y combinaciones con condiciones lógicas.",
    content: `# Lección 5: Filtrar y Seleccionar — loc, iloc y Condiciones Booleanas

## 🎯 Objetivo de aprendizaje

**Una sola idea:** Aprender a seleccionar subconjuntos de datos de un DataFrame usando posición (\`iloc\`), etiqueta (\`loc\`) y condiciones booleanas.

---

## Requisitos previos

- **Lecciones 0-4 de este curso:** DataFrames, columnas, \`.isnull()\`, tipos de datos.
- **Curso 1, Lección 3:** Indexación de arrays NumPy con corchetes.

## ⏱️ Tiempo estimado: 35 minutos

---

## ¿Por qué existe este concepto?

Tienes un dataset del Titanic con 891 pasajeros. Tu jefe pregunta: "¿Cuántas mujeres mayores de 30 años en primera clase sobrevivieron?" No puedes recorrer fila por fila. Necesitas decirle a Pandas: "Dame solo las filas donde Sex == Female Y Age > 30 Y Pclass == 1 Y Survived == 1."

Filtrar es la operación más frecuente en análisis de datos. La usarás más que cualquier otra cosa.

---

## Explicación intuitiva

Piensa en un filtro de café:
- **Sin filtro** → recibes todo (891 filas). Imposible de analizar.
- **Un filtro** → "Solo mujeres" → recibes ~300 filas.
- **Dos filtros** → "Solo mujeres mayores de 30" → recibes ~80 filas.
- **Tres filtros** → "Solo mujeres mayores de 30 en 1ra clase" → recibes ~20 filas.

Cada condición es un filtro que reduce los datos hasta tener exactamente lo que necesitas.

---

## Explicación técnica

Pandas tiene dos sistemas de acceso:

| Sistema | Sintaxis | Usa | Ejemplo |
|---------|----------|-----|---------|
| \`iloc\` | \`df.iloc[fila, col]\` | Posición numérica (0, 1, 2...) | \`df.iloc[0, 2]\` = fila 0, columna 2 |
| \`loc\` | \`df.loc[fila, col]\` | Etiquetas (nombres) | \`df.loc[0, "Age"]\` = fila 0, columna "Age" |

Y el sistema de **máscara booleana**:
1. Creas una condición: \`df["Age"] > 30\` → Serie de True/False
2. Pasas esa condición al DataFrame: \`df[df["Age"] > 30]\` → Solo filas donde es True

Operadores lógicos en Pandas:
| Lógica | Python normal | Pandas |
|--------|--------------|--------|
| Y | \`and\` | \`&\` |
| O | \`or\` | \`\\|\` |
| NO | \`not\` | \`~\` |

⚠️ Siempre usa paréntesis: \`(condicion1) & (condicion2)\`

---

## 💻 Programa completo

\`\`\`python
# leccion_05_filtrar.py
# Seleccionar exactamente los datos que necesitas

import pandas as pd

url = "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv"
titanic = pd.read_csv(url)

# --- PARTE 1: iloc - acceso por posición ---
print("=== ILOC: ACCESO POR POSICIÓN ===")
print("Primera fila:", titanic.iloc[0].to_dict())
print("\\nFila 5, columna 3:", titanic.iloc[5, 3])
print("\\nPrimeras 3 filas, primeras 4 columnas:")
print(titanic.iloc[0:3, 0:4])

# --- PARTE 2: loc - acceso por etiqueta ---
print("\\n=== LOC: ACCESO POR ETIQUETA ===")
print("Fila 0, columna 'Name':", titanic.loc[0, "Name"])
print("\\nFilas 0-2, columnas específicas:")
print(titanic.loc[0:2, ["Name", "Age", "Sex"]])

# --- PARTE 3: Seleccionar columnas ---
print("\\n=== SELECCIONAR COLUMNAS ===")
# Una columna (devuelve Serie)
edades = titanic["Age"]
print(f"Tipo de una columna: {type(edades)}")

# Varias columnas (devuelve DataFrame)
subset = titanic[["Name", "Age", "Survived"]]
print(f"Tipo de varias columnas: {type(subset)}")
print(subset.head(3))

# --- PARTE 4: Filtrado con condiciones booleanas ---
print("\\n=== FILTRADO BOOLEANO ===")

# La máscara: una Serie de True/False
mascara = titanic["Age"] > 30
print(f"Tipo de la máscara: {type(mascara)}")
print(f"Primeros 5 valores: {list(mascara.head())}")
print(f"Cuántos True: {mascara.sum()}")

# Aplicar la máscara
mayores_30 = titanic[mascara]
print(f"\\nPasajeros > 30 años: {len(mayores_30)} de {len(titanic)}")

# --- PARTE 5: Condiciones combinadas ---
print("\\n=== CONDICIONES COMBINADAS ===")

# Mujeres que sobrevivieron
mujeres_vivas = titanic[(titanic["Sex"] == "female") & (titanic["Survived"] == 1)]
print(f"Mujeres sobrevivientes: {len(mujeres_vivas)}")

# Pasajeros de 1ra clase menores de 18
jovenes_1ra = titanic[(titanic["Pclass"] == 1) & (titanic["Age"] < 18)]
print(f"Menores de 18 en 1ra clase: {len(jovenes_1ra)}")
print(jovenes_1ra[["Name", "Age", "Survived"]])

# Pregunta compleja: mujeres > 30 en 1ra clase que sobrevivieron
filtro = (
    (titanic["Sex"] == "female") &
    (titanic["Age"] > 30) &
    (titanic["Pclass"] == 1) &
    (titanic["Survived"] == 1)
)
resultado = titanic[filtro]
print(f"\\nMujeres >30, 1ra clase, sobrevivieron: {len(resultado)}")

# --- PARTE 6: Negación y OR ---
print("\\n=== NEGACIÓN Y OR ===")
# NO mujeres (es decir, hombres)
hombres = titanic[~(titanic["Sex"] == "female")]
print(f"Usando negación: {len(hombres)} hombres")

# Clase 1 O clase 2
clase_alta = titanic[(titanic["Pclass"] == 1) | (titanic["Pclass"] == 2)]
print(f"Clase 1 o 2: {len(clase_alta)} pasajeros")

# Alternativa elegante con .isin()
clase_alta2 = titanic[titanic["Pclass"].isin([1, 2])]
print(f"Con isin(): {len(clase_alta2)} pasajeros")
\`\`\`

---

## 🔍 Explicación línea por línea

- **\`titanic.iloc[0]\`:** Primera fila por posición. Devuelve una Serie (nombre → valor).
- **\`titanic.iloc[0:3, 0:4]\`:** Slicing como en NumPy. Filas 0, 1, 2 y columnas 0, 1, 2, 3. Recuerda: el final es exclusivo.
- **\`titanic.loc[0:2, ["Name", "Age"]]\`:** Con \`loc\`, el final es **inclusivo** (incluye fila 2). Usas nombres de columna.
- **\`titanic[["Name", "Age"]]\`:** Doble corchete = seleccionar varias columnas. El corchete externo es del DataFrame, el interno es la lista.
- **\`titanic["Age"] > 30\`:** Crea una Serie booleana. Cada fila dice True o False.
- **\`mascara.sum()\`:** True se trata como 1, False como 0. \`.sum()\` cuenta cuántos True hay.
- **\`(cond1) & (cond2)\`:** Los paréntesis son OBLIGATORIOS. Sin ellos, Python se confunde con la precedencia de operadores.
- **\`.isin([1, 2])\`:** Devuelve True si el valor está en la lista. Más limpio que encadenar \`|\`.

---

## 📊 Visualización

\`\`\`
MÁSCARA BOOLEANA — Cómo funciona:

titanic["Age"]     >  30     =   máscara          titanic[máscara]
┌──────────┐              ┌──────────┐         ┌──────────────────┐
│  22.0    │   False      │  False   │         │  (se excluye)    │
│  38.0    │   True       │  True    │  ────►  │  fila de 38 años │
│  26.0    │   False      │  False   │         │  (se excluye)    │
│  35.0    │   True       │  True    │  ────►  │  fila de 35 años │
│  NaN     │   False*     │  False   │         │  (se excluye)    │
└──────────┘              └──────────┘         └──────────────────┘
* NaN > 30 = False (NaN en comparaciones siempre da False)

ILOC vs LOC:
  iloc[0:3]  → filas 0, 1, 2       (final EXCLUSIVO, como Python)
  loc[0:3]   → filas 0, 1, 2, 3    (final INCLUSIVO, como etiquetas)
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: iloc vs loc con slicing
\`\`\`python
print("iloc[0:3]:", len(titanic.iloc[0:3]), "filas")
print("loc[0:3]:", len(titanic.loc[0:3]), "filas")
\`\`\`
> **Predice:** ¿Dan la misma cantidad? ¿Por qué no?

### Experimento 2: ¿Qué pasa con NaN en filtros?
\`\`\`python
print("Mayores de 30:", len(titanic[titanic["Age"] > 30]))
print("Menores o igual a 30:", len(titanic[titanic["Age"] <= 30]))
print("Total original:", len(titanic))
print("Suma de ambos filtros:", len(titanic[titanic["Age"] > 30]) + len(titanic[titanic["Age"] <= 30]))
\`\`\`
> **Observa:** La suma no da 891. ¿A dónde fueron los NaN?

### Experimento 3: Porcentaje de supervivencia por grupo
\`\`\`python
mujeres = titanic[titanic["Sex"] == "female"]
hombres = titanic[titanic["Sex"] == "male"]
print(f"Supervivencia mujeres: {mujeres['Survived'].mean()*100:.1f}%")
print(f"Supervivencia hombres: {hombres['Survived'].mean()*100:.1f}%")
\`\`\`
> **Analiza:** ¿El resultado te sorprende? Esto es análisis de datos real.

---

## ⚠️ Errores comunes

**Error 1: Olvidar paréntesis en condiciones combinadas**
\`\`\`python
# ❌ ValueError: The truth value of a Series is ambiguous
titanic[titanic["Age"] > 30 & titanic["Sex"] == "female"]

# ✅ Paréntesis obligatorios
titanic[(titanic["Age"] > 30) & (titanic["Sex"] == "female")]
\`\`\`

**Error 2: Usar and/or en vez de &/|**
\`\`\`python
# ❌ ValueError: ambiguous
titanic[(titanic["Age"] > 30) and (titanic["Sex"] == "female")]

# ✅ Operadores bitwise para Series
titanic[(titanic["Age"] > 30) & (titanic["Sex"] == "female")]
\`\`\`

**Error 3: Corchete simple vs doble**
\`\`\`python
# Una columna → Serie
titanic["Name"]

# Varias columnas → DataFrame
titanic[["Name", "Age"]]

# ❌ Error común: olvidar los corchetes internos
titanic["Name", "Age"]  # KeyError
\`\`\`

---

## 🏆 Desafío

Con el dataset del Titanic, responde estas preguntas usando filtrado:
1. ¿Cuántos niños (Age < 12) viajaban?
2. ¿Qué porcentaje de los niños sobrevivió?
3. ¿Cuántos pasajeros de 3ra clase pagaron más de $20 de tarifa?
4. Muestra el nombre y edad de las 5 personas más jóvenes que sobrevivieron.

<details>
<summary>Ver solución</summary>

\`\`\`python
import pandas as pd
url = "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv"
titanic = pd.read_csv(url)

ninos = titanic[titanic["Age"] < 12]
print(f"1. Niños: {len(ninos)}")
print(f"2. Supervivencia niños: {ninos['Survived'].mean()*100:.1f}%")

clase3_caro = titanic[(titanic["Pclass"] == 3) & (titanic["Fare"] > 20)]
print(f"3. 3ra clase >$20: {len(clase3_caro)}")

jovenes_vivos = titanic[titanic["Survived"] == 1].sort_values("Age").head(5)
print(f"4. Los 5 más jóvenes que sobrevivieron:")
print(jovenes_vivos[["Name", "Age"]])
\`\`\`
</details>

---

## 🧠 Autoevaluación

1. **¿Qué diferencia hay entre \`iloc\` y \`loc\`?** → \`iloc\` usa posición numérica, \`loc\` usa etiquetas/nombres
2. **¿Qué operador usas para AND en Pandas?** → \`&\` (con paréntesis obligatorios)
3. **¿Qué devuelve \`df["col"] > valor\`?** → Una Serie booleana (True/False por fila)

---

## 📖 Glosario

| Término | Definición |
|---------|-----------|
| **iloc** | Integer Location: acceso por posición numérica |
| **loc** | Label Location: acceso por etiqueta/nombre |
| **máscara booleana** | Serie de True/False usada para filtrar filas |
| **isin()** | Método que verifica si valores están en una lista |

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| \`df.iloc[f, c]\` | Acceso por posición |
| \`df.loc[f, "col"]\` | Acceso por etiqueta |
| \`df[condicion]\` | Filtrar filas con máscara booleana |
| \`&\`, \`\\|\`, \`~\` | AND, OR, NOT para Pandas |
| \`.isin([...])\` | Pertenencia a una lista |
| \`.sort_values("col")\` | Ordenar por columna |

---

## ➡️ ¿Qué sigue y por qué?

Ya podemos filtrar datos individuales. Pero a menudo necesitamos respuestas agregadas: "¿Cuál es la tarifa promedio POR clase?" o "¿Cuántos pasajeros POR puerto de embarque?" En la próxima lección aprenderemos \`groupby\` — la herramienta para **agrupar y resumir** datos, equivalente a las tablas dinámicas de Excel.
`
  }
]
