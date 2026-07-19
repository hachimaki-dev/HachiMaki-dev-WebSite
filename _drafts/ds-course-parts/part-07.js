// Part 7: Lesson 7 - Combinar datasets
export default [
  {
    title: "Combinar Datasets - merge, join y concat",
    excerpt: "Los datos rara vez viven en una sola tabla. Aprende a unir múltiples DataFrames como un profesional.",
    content: `# Lección 7: Combinar Datasets — merge, join y concat

## 🎯 Objetivo de aprendizaje

**Una sola idea:** Aprender a unir dos o más DataFrames usando \`pd.merge()\` (por columna clave), \`pd.concat()\` (apilar filas o columnas) y entender los tipos de join.

---

## Requisitos previos

- **Lecciones 0-6 de este curso:** DataFrames, columnas, groupby, filtrado.

## ⏱️ Tiempo estimado: 30 minutos

---

## ¿Por qué existe este concepto?

Imagina una tienda online. Los datos de clientes están en una tabla, los pedidos en otra, y los productos en otra. Para responder "¿Cuánto gastó María en total?", necesitas combinar las tres tablas. Esto es exactamente lo que hace \`merge\`: une tablas por una columna en común, como el VLOOKUP de Excel pero mucho más poderoso.

---

## Explicación intuitiva

- **\`pd.concat()\`** = **apilar**. Como poner una hoja de papel encima de otra. Útil cuando tienes los mismos datos de diferentes meses.
- **\`pd.merge()\`** = **cruzar**. Como buscar en una tabla el dato correspondiente de otra tabla usando un código común. Es el VLOOKUP de Excel.

---

## Explicación técnica

| Función | ¿Qué hace? | Ejemplo |
|---------|-------------|---------|
| \`pd.concat([df1, df2])\` | Apila filas (vertical) | Datos de enero + febrero |
| \`pd.concat([df1, df2], axis=1)\` | Apila columnas (horizontal) | Agregar columnas |
| \`pd.merge(df1, df2, on="col")\` | Une por columna común | Clientes + Pedidos |

Tipos de merge (join):

| Tipo | ¿Qué incluye? |
|------|----------------|
| \`inner\` (defecto) | Solo filas que están en AMBAS tablas |
| \`left\` | Todas las filas de la tabla izquierda + coincidencias de la derecha |
| \`right\` | Todas las filas de la tabla derecha + coincidencias de la izquierda |
| \`outer\` | TODAS las filas de ambas tablas |

---

## 💻 Programa completo

\`\`\`python
# leccion_07_combinar.py
# Unir múltiples DataFrames: merge, concat y tipos de join

import pandas as pd

# --- PARTE 1: Crear datos de ejemplo ---
clientes = pd.DataFrame({
    "cliente_id": [1, 2, 3, 4],
    "nombre": ["Ana", "Carlos", "María", "Pedro"],
    "ciudad": ["Santiago", "Lima", "Bogotá", "CDMX"]
})

pedidos = pd.DataFrame({
    "pedido_id": [101, 102, 103, 104, 105],
    "cliente_id": [1, 2, 1, 3, 5],
    "producto": ["Laptop", "Mouse", "Teclado", "Monitor", "Cable"],
    "monto": [999, 25, 75, 350, 10]
})

print("=== TABLAS ORIGINALES ===")
print("Clientes:")
print(clientes)
print("\\nPedidos:")
print(pedidos)

# --- PARTE 2: merge (inner join) ---
print("\\n=== INNER MERGE (por defecto) ===")
inner = pd.merge(clientes, pedidos, on="cliente_id")
print(inner)
print("Nota: Pedro (id=4) no aparece (no tiene pedidos)")
print("Nota: Pedido 105 (id=5) no aparece (cliente no existe)")

# --- PARTE 3: left join ---
print("\\n=== LEFT MERGE ===")
left = pd.merge(clientes, pedidos, on="cliente_id", how="left")
print(left)
print("Pedro aparece con NaN (no tiene pedidos)")

# --- PARTE 4: outer join ---
print("\\n=== OUTER MERGE ===")
outer = pd.merge(clientes, pedidos, on="cliente_id", how="outer")
print(outer)
print("Todos aparecen, con NaN donde falta info")

# --- PARTE 5: concat - apilar filas ---
print("\\n=== CONCAT: APILAR FILAS ===")
enero = pd.DataFrame({
    "fecha": ["2024-01-05", "2024-01-12"],
    "ventas": [100, 150]
})
febrero = pd.DataFrame({
    "fecha": ["2024-02-03", "2024-02-18"],
    "ventas": [200, 80]
})
semestre = pd.concat([enero, febrero], ignore_index=True)
print(semestre)

# --- PARTE 6: Ejemplo real con Titanic ---
print("\\n=== EJEMPLO REAL: TITANIC ===")
titanic = pd.read_csv("https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv")

# Crear resumen por clase
resumen_clase = titanic.groupby("Pclass").agg(
    supervivencia=("Survived", "mean"),
    pasajeros=("PassengerId", "count")
).reset_index()

# Crear info adicional de clases
info_clase = pd.DataFrame({
    "Pclass": [1, 2, 3],
    "nombre_clase": ["Primera", "Segunda", "Tercera"],
    "ubicacion_barco": ["Cubierta superior", "Cubierta media", "Cubierta inferior"]
})

# Unir
clase_completa = pd.merge(resumen_clase, info_clase, on="Pclass")
print(clase_completa)
\`\`\`

---

## 🔍 Explicación línea por línea

- **\`pd.merge(clientes, pedidos, on="cliente_id")\`:** Une ambas tablas por la columna \`cliente_id\`. Por defecto hace inner join: solo incluye filas donde el id existe en AMBAS tablas.
- **\`how="left"\`:** Mantiene TODAS las filas de la tabla izquierda (clientes). Si no hay pedido para un cliente, pone NaN.
- **\`how="outer"\`:** Mantiene TODO. Filas sin coincidencia en cualquier tabla se rellenan con NaN.
- **\`pd.concat([enero, febrero])\`:** Apila los DataFrames verticalmente (uno debajo del otro). Ambos deben tener las mismas columnas.
- **\`ignore_index=True\`:** Reinicia el índice (0, 1, 2, 3) en vez de mantener los índices originales (0, 1, 0, 1).
- **\`.reset_index()\`:** Convierte el índice del groupby de vuelta a columna normal, necesario para hacer merge.

---

## 📊 Visualización

\`\`\`
INNER MERGE (solo coincidencias):

  clientes          pedidos              resultado
  id nombre         id cli prod          id nombre  prod   monto
  1  Ana            101 1  Laptop        1  Ana     Laptop  999
  2  Carlos         102 2  Mouse    ──►  1  Ana     Teclado  75
  3  María          103 1  Teclado       2  Carlos  Mouse    25
  4  Pedro ✗        104 3  Monitor       3  María   Monitor 350
                    105 5  Cable ✗

  Pedro no tiene pedidos → se excluye
  Pedido 105 (cli=5) no existe → se excluye

LEFT MERGE (todos los clientes):
  Igual que inner, pero Pedro aparece con NaN en producto y monto.

CONCAT (apilar):
  enero:    fecha       ventas      semestre: fecha       ventas
            2024-01-05  100                   2024-01-05  100
            2024-01-12  150                   2024-01-12  150
  febrero:  2024-02-03  200     ──►           2024-02-03  200
            2024-02-18  80                    2024-02-18  80
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: ¿Cuántas filas da cada tipo de merge?
\`\`\`python
print("Inner:", len(pd.merge(clientes, pedidos, on="cliente_id")))
print("Left:", len(pd.merge(clientes, pedidos, on="cliente_id", how="left")))
print("Right:", len(pd.merge(clientes, pedidos, on="cliente_id", how="right")))
print("Outer:", len(pd.merge(clientes, pedidos, on="cliente_id", how="outer")))
\`\`\`
> **Predice:** ¿Cuál tiene más filas? ¿Cuál tiene menos?

### Experimento 2: Merge con columnas de diferente nombre
\`\`\`python
df_a = pd.DataFrame({"codigo": [1, 2], "nombre": ["A", "B"]})
df_b = pd.DataFrame({"id": [1, 2], "valor": [100, 200]})
resultado = pd.merge(df_a, df_b, left_on="codigo", right_on="id")
print(resultado)
\`\`\`
> **Observa:** Cuando las columnas clave tienen nombres diferentes, usas \`left_on\` y \`right_on\`.

### Experimento 3: Concat horizontal
\`\`\`python
nombres = pd.DataFrame({"nombre": ["Ana", "Carlos"]})
edades = pd.DataFrame({"edad": [28, 35]})
junto = pd.concat([nombres, edades], axis=1)
print(junto)
\`\`\`
> **Observa:** \`axis=1\` apila columnas en vez de filas.

---

## ⚠️ Errores comunes

**Error 1: Merge sin columna común**
\`\`\`python
# ❌ MergeError: No common columns to perform merge on
df1 = pd.DataFrame({"a": [1]})
df2 = pd.DataFrame({"b": [1]})
pd.merge(df1, df2)

# ✅ Especifica las columnas
pd.merge(df1, df2, left_on="a", right_on="b")
\`\`\`

**Error 2: Índice duplicado en concat**
\`\`\`python
# Sin ignore_index, los índices se repiten
resultado = pd.concat([enero, febrero])
print(resultado.index.tolist())  # [0, 1, 0, 1] ← duplicados

# ✅ Usa ignore_index
resultado = pd.concat([enero, febrero], ignore_index=True)
print(resultado.index.tolist())  # [0, 1, 2, 3] ← limpio
\`\`\`

**Error 3: Multiplicación de filas inesperada**
\`\`\`python
# Si la clave no es única, merge crea el producto cartesiano
# 1 cliente con 3 pedidos = 3 filas para ese cliente
# Siempre verifica: ¿el merge aumentó las filas más de lo esperado?
print(f"Clientes: {len(clientes)}, Pedidos: {len(pedidos)}")
print(f"Inner merge: {len(inner)} filas")
\`\`\`

---

## 🏆 Desafío

Crea dos DataFrames: uno con 5 estudiantes (id, nombre, carrera) y otro con sus notas (id_estudiante, materia, nota). Haz un left merge y calcula el promedio de notas por carrera usando groupby.

<details>
<summary>Ver solución</summary>

\`\`\`python
import pandas as pd

estudiantes = pd.DataFrame({
    "id": [1, 2, 3, 4, 5],
    "nombre": ["Ana", "Luis", "María", "Carlos", "Sofía"],
    "carrera": ["Ingeniería", "Medicina", "Ingeniería", "Medicina", "Ingeniería"]
})

notas = pd.DataFrame({
    "id_estudiante": [1, 1, 2, 3, 3, 4, 5],
    "materia": ["Cálculo", "Física", "Anatomía", "Cálculo", "Física", "Biología", "Cálculo"],
    "nota": [6.5, 5.8, 6.0, 7.0, 6.2, 5.5, 6.8]
})

completo = pd.merge(estudiantes, notas, left_on="id", right_on="id_estudiante", how="left")
promedio = completo.groupby("carrera")["nota"].mean().round(2)
print(promedio)
\`\`\`
</details>

---

## 🧠 Autoevaluación

1. **¿Qué tipo de merge incluye solo filas con coincidencia en ambas tablas?** → \`inner\`
2. **¿Qué función usas para apilar dos DataFrames con las mismas columnas?** → \`pd.concat()\`
3. **¿Qué pasa si haces left merge y una fila de la tabla izquierda no tiene coincidencia?** → Aparece con NaN en las columnas de la tabla derecha

---

## 📖 Glosario

| Término | Definición |
|---------|-----------|
| **merge** | Unir dos tablas por una columna clave en común |
| **join** | Tipo de unión: inner, left, right, outer |
| **concat** | Apilar DataFrames vertical u horizontalmente |
| **inner join** | Solo filas con coincidencia en ambas tablas |
| **left join** | Todas las filas de la tabla izquierda + coincidencias |

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| \`pd.merge(df1, df2, on="col")\` | Une por columna común |
| \`how="left/right/outer"\` | Tipo de join |
| \`left_on, right_on\` | Cuando las columnas clave tienen diferente nombre |
| \`pd.concat([df1, df2])\` | Apila filas |
| \`ignore_index=True\` | Reinicia índice al concatenar |

---

## ➡️ ¿Qué sigue y por qué?

Hemos aprendido a cargar, limpiar, filtrar, agrupar y combinar datos. Ahora viene la parte más visual del curso: **crear gráficos**. Un buen gráfico comunica en 2 segundos lo que una tabla tarda 2 minutos en transmitir. En la próxima lección aprenderemos **Matplotlib**, la biblioteca base de visualización en Python.
`
  }
]
