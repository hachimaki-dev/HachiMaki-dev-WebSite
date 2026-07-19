// Part 2: Lesson 2 - Cargar datos reales
export default [
  {
    title: "Cargar Datos Reales - CSV, Excel y los Problemas del Mundo Real",
    excerpt: "Los datos reales vienen en archivos desordenados. Aprende a cargar CSV y Excel con Pandas, y a resolver problemas de encoding y separadores.",
    content: `# Lección 2: Cargar Datos Reales — CSV, Excel y los Problemas del Mundo Real

## 🎯 Objetivo de aprendizaje

**Una sola idea:** Aprender a cargar datos desde archivos CSV y Excel usando \`pd.read_csv()\` y \`pd.read_excel()\`, y resolver los problemas más comunes al hacerlo.

---

## Requisitos previos

- **Lección 0-1 de este curso:** Saber importar Pandas, crear DataFrames, usar \`.shape\`, \`.head()\`, \`.dtypes\`.
- **Curso 1, Lección 2:** Variables y tipos de datos.

## ⏱️ Tiempo estimado: 30 minutos

---

## ¿Por qué existe este concepto?

En la lección anterior usamos \`sns.load_dataset()\` — un dataset ya limpio y empaquetado. Pero en tu trabajo real, los datos llegan así:

- Un archivo CSV que un colega exportó desde Excel... en español, con punto y coma como separador.
- Un Excel con 3 hojas, y solo necesitas la segunda.
- Un CSV descargado de internet que muestra \`Ã±\` en lugar de \`ñ\` porque el encoding es incorrecto.

\`pd.read_csv()\` tiene más de 50 parámetros justamente porque los archivos del mundo real son un desastre.

---

## Explicación intuitiva

Piensa en recibir un paquete por correo:
- **CSV perfecto:** El paquete llega bien envuelto, con etiqueta clara. Solo lo abres.
- **CSV real:** El paquete llega mojado, la etiqueta está en otro idioma, y usaron cinta adhesiva en vez de la caja correcta. Necesitas herramientas para abrirlo sin romper el contenido.

\`pd.read_csv()\` es esa navaja suiza que te permite abrir cualquier paquete.

---

## Explicación técnica

**CSV** (Comma-Separated Values) es el formato más universal para datos tabulares. Es un archivo de texto plano donde:
- Cada línea es una fila
- Los valores están separados por un delimitador (coma, punto y coma, tabulación)
- La primera línea suele ser el encabezado

Problemas comunes:

| Problema | Causa | Solución en Pandas |
|----------|-------|-------------------|
| Caracteres raros (Ã±) | Encoding incorrecto | \`encoding="latin-1"\` |
| Todo en una columna | Separador no es coma | \`sep=";"\` |
| Fila extra de basura | Metadatos al inicio | \`skiprows=N\` |
| Columna índice extra | Excel agrega índice | \`index_col=0\` |

---

## 💻 Programa completo

\`\`\`python
# leccion_02_cargar_datos.py
# Cargar datos reales desde diferentes fuentes

import pandas as pd
import seaborn as sns

# --- PARTE 1: Cargar dataset desde URL (CSV real) ---
print("=== CARGAR CSV DESDE URL ===")
url = "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv"
titanic = pd.read_csv(url)
print(f"Forma: {titanic.shape}")
print(f"Columnas: {list(titanic.columns)}")
print(titanic.head())

# --- PARTE 2: Parámetros útiles de read_csv ---
print("\\n=== PARÁMETROS DE read_csv ===")

# Cargar solo algunas columnas
cols_interes = ["Name", "Age", "Sex", "Survived"]
titanic_mini = pd.read_csv(url, usecols=cols_interes)
print(f"Solo {len(cols_interes)} columnas: {list(titanic_mini.columns)}")
print(titanic_mini.head(3))

# Cargar solo las primeras N filas (útil con archivos gigantes)
muestra = pd.read_csv(url, nrows=10)
print(f"\\nSolo primeras 10 filas: {muestra.shape}")

# --- PARTE 3: Separadores y encoding ---
print("\\n=== SIMULANDO PROBLEMAS REALES ===")

# Crear un CSV con punto y coma (común en español/europeo)
csv_texto = """nombre;edad;ciudad
Ana García;28;Madrid
José López;35;Buenos Aires
María Ñoño;42;Santiago"""

# Guardarlo temporalmente
with open("/tmp/datos_es.csv", "w", encoding="utf-8") as f:
    f.write(csv_texto)

# Carga INCORRECTA (asume coma)
print("❌ Sin especificar separador:")
df_mal = pd.read_csv("/tmp/datos_es.csv")
print(df_mal.head())
print(f"Columnas detectadas: {list(df_mal.columns)}")

# Carga CORRECTA
print("\\n✅ Con sep=';':")
df_bien = pd.read_csv("/tmp/datos_es.csv", sep=";")
print(df_bien.head())
print(f"Columnas detectadas: {list(df_bien.columns)}")

# --- PARTE 4: Inspección post-carga ---
print("\\n=== INSPECCIÓN POST-CARGA ===")
print("Verificando el Titanic completo:")
print(f"  Filas: {len(titanic)}")
print(f"  Columnas: {len(titanic.columns)}")
print(f"  Memoria: {titanic.memory_usage(deep=True).sum() / 1024:.1f} KB")
print(f"\\nTipos de datos:")
print(titanic.dtypes)
\`\`\`

---

## 🔍 Explicación línea por línea

- **\`pd.read_csv(url)\`:** Pandas puede leer directamente desde una URL, no solo archivos locales. Descarga el CSV y lo convierte en DataFrame.
- **\`usecols=cols_interes\`:** Carga solo las columnas que necesitas. Con archivos de 100 columnas, esto ahorra memoria y tiempo.
- **\`nrows=10\`:** Carga solo las primeras 10 filas. Perfecto para explorar un archivo enorme sin esperar.
- **\`sep=";"\`:** Indica que el separador es punto y coma, no coma. Sin esto, Pandas cree que toda la línea es una sola columna.
- **\`encoding="utf-8"\`:** Especifica la codificación del archivo. UTF-8 es el estándar moderno; \`latin-1\` funciona para archivos viejos en español.
- **\`memory_usage(deep=True)\`:** Muestra cuánta memoria RAM ocupa cada columna. \`deep=True\` calcula el tamaño real de las columnas de texto.

---

## 📊 Visualización

\`\`\`
CARGA INCORRECTA (sin sep=";"):
              nombre;edad;ciudad       ← TODO en una sola columna
0  Ana García;28;Madrid
1  José López;35;Buenos Aires

CARGA CORRECTA (con sep=";"):
        nombre  edad          ciudad   ← 3 columnas bien separadas
0   Ana García    28          Madrid
1   José López    35    Buenos Aires
2  María Ñoño    42        Santiago

PROCESO DE CARGA:

  Archivo CSV                  pd.read_csv()              DataFrame
  ┌──────────────┐            ┌──────────┐            ┌──────────────┐
  │ nombre,edad  │  ────►     │ Detectar │  ────►     │   nombre│edad│
  │ Ana,28       │            │ separador│            │   Ana   │ 28│
  │ José,35      │            │ encoding │            │   José  │ 35│
  └──────────────┘            │ tipos    │            └──────────────┘
                              └──────────┘
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: ¿Qué pasa sin encabezado?
\`\`\`python
df_sin = pd.read_csv(url, header=None, nrows=3)
print(df_sin)
\`\`\`
> **Observa:** \`header=None\` ignora la primera fila como encabezado. Las columnas se llaman 0, 1, 2... ¿Cuándo sería útil esto?

### Experimento 2: Cambiar nombres de columnas al cargar
\`\`\`python
df_renombrado = pd.read_csv(url, usecols=["Name", "Age"], nrows=5)
df_renombrado.columns = ["nombre", "edad"]
print(df_renombrado)
\`\`\`
> **Observa:** Puedes renombrar columnas asignando una lista a \`.columns\`.

### Experimento 3: El dataset de Seaborn vs CSV
\`\`\`python
tips_seaborn = sns.load_dataset("tips")
tips_csv = pd.read_csv("https://raw.githubusercontent.com/mwaskom/seaborn-data/master/tips.csv")
print("¿Son iguales?", tips_seaborn.equals(tips_csv))
print("Seaborn dtypes:", tips_seaborn.dtypes.to_dict())
print("CSV dtypes:", tips_csv.dtypes.to_dict())
\`\`\`
> **Observa:** Pueden no ser idénticos porque Seaborn convierte algunas columnas a tipo \`category\`. El CSV las deja como \`object\`.

---

## ⚠️ Errores comunes

**Error 1: FileNotFoundError**
\`\`\`python
# ❌ FileNotFoundError: No such file or directory
pd.read_csv("mis_datos.csv")

# ✅ Verifica la ruta o usa ruta absoluta
pd.read_csv("/content/mis_datos.csv")  # En Colab
\`\`\`

**Error 2: UnicodeDecodeError (encoding)**
\`\`\`python
# ❌ UnicodeDecodeError: 'utf-8' codec can't decode...
pd.read_csv("archivo_viejo.csv")

# ✅ Prueba con latin-1 (funciona para la mayoría de archivos en español)
pd.read_csv("archivo_viejo.csv", encoding="latin-1")
\`\`\`

**Error 3: ParserError por separador incorrecto**
\`\`\`python
# ❌ ParserError: Error tokenizing data
pd.read_csv("datos_europeos.csv")  # Usa ; pero Pandas espera ,

# ✅ Especifica el separador
pd.read_csv("datos_europeos.csv", sep=";")
\`\`\`

---

## 🏆 Desafío

Carga el dataset del Titanic desde la URL del programa. Luego:
1. Carga solo las columnas \`Survived\`, \`Pclass\`, \`Sex\`, \`Age\`, \`Fare\`.
2. Muestra las primeras 8 filas.
3. ¿Cuánta memoria usa este DataFrame reducido vs. el completo?

<details>
<summary>Ver solución</summary>

\`\`\`python
import pandas as pd
url = "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv"

completo = pd.read_csv(url)
reducido = pd.read_csv(url, usecols=["Survived", "Pclass", "Sex", "Age", "Fare"])

print("Primeras 8 filas:")
print(reducido.head(8))

mem_completo = completo.memory_usage(deep=True).sum() / 1024
mem_reducido = reducido.memory_usage(deep=True).sum() / 1024
print(f"\\nMemoria completo: {mem_completo:.1f} KB")
print(f"Memoria reducido: {mem_reducido:.1f} KB")
print(f"Ahorro: {(1 - mem_reducido/mem_completo)*100:.0f}%")
\`\`\`
</details>

---

## 🧠 Autoevaluación

1. **¿Qué parámetro usas para archivos separados por punto y coma?** → \`sep=";"\`
2. **¿Cómo cargas solo las primeras 100 filas de un CSV enorme?** → \`pd.read_csv("archivo.csv", nrows=100)\`
3. **¿Qué encoding pruebas cuando falla UTF-8 con archivos en español?** → \`encoding="latin-1"\`

---

## 📖 Glosario

| Término | Definición |
|---------|-----------|
| **CSV** | Comma-Separated Values: archivo de texto con datos separados por un delimitador |
| **encoding** | Sistema de codificación de caracteres (UTF-8, latin-1, etc.) |
| **delimiter / sep** | Carácter que separa valores en cada fila (coma, punto y coma, tab) |
| **header** | Fila del archivo que contiene los nombres de las columnas |
| **usecols** | Parámetro para cargar solo columnas específicas |

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| \`pd.read_csv(path)\` | Carga CSV desde archivo local o URL |
| \`sep=";"\` | Cambia el separador |
| \`encoding="latin-1"\` | Resuelve problemas de caracteres |
| \`usecols=[...]\` | Carga solo columnas específicas |
| \`nrows=N\` | Carga solo N primeras filas |
| \`header=None\` | Ignora encabezado |
| \`df.memory_usage()\` | Muestra uso de memoria |

---

## ➡️ ¿Qué sigue y por qué?

Ya sabemos cargar datos desde archivos. Pero cargar no es entender. Un archivo puede tener 891 filas y 12 columnas — ¿cómo sabes rápidamente qué contiene? En la próxima lección aprenderemos a **explorar un dataset** usando \`.info()\`, \`.describe()\` y otras herramientas para entender tus datos en segundos.
`
  }
]
