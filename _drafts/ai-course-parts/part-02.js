// Part 2: Lessons 3-4
export default [
  {
    title: "Listas - Colecciones de Datos",
    excerpt: "Una sola variable que contiene muchos valores. Las listas son el ancestro directo de los tensores en IA.",
    content: `# Lección 3: Listas — Colecciones de Datos

## 🎯 Objetivo de aprendizaje

**Una sola idea:** Una lista es una **secuencia ordenada** de valores almacenados en una sola variable, accesibles por su posición (índice).

---

## ¿Por qué existe este concepto?

En la lección anterior, nuestra neurona tenía 2 entradas:
\`\`\`python
entrada1 = 0.5
entrada2 = 0.3
\`\`\`

Una red neuronal real tiene **miles o millones** de entradas. No podemos crear una variable para cada una. Necesitamos una estructura que agrupe muchos valores bajo un solo nombre.

En IA, todos los datos llegan como **colecciones**: una imagen es una lista de píxeles, una oración es una lista de palabras, un dataset es una lista de ejemplos.

---

## Explicación intuitiva

Imagina un **tren con vagones numerados**:
- El tren completo es la **lista**
- Cada vagón es una **posición** (índice)
- Dentro de cada vagón hay un **valor**
- El primer vagón es el número **0** (no el 1)

Para pedir el contenido del vagón 3, dices: \`tren[3]\`

---

## Explicación técnica

Una **lista** en Python se crea con corchetes \`[]\`:
\`\`\`python
pesos = [0.8, 0.6, 0.3, 0.1]
\`\`\`

El **índice** empieza en 0:
| Índice | 0 | 1 | 2 | 3 |
|--------|-----|-----|-----|-----|
| Valor | 0.8 | 0.6 | 0.3 | 0.1 |

Operaciones fundamentales:
- Acceder: \`pesos[0]\` → \`0.8\`
- Modificar: \`pesos[1] = 0.9\`
- Longitud: \`len(pesos)\` → \`4\`
- Agregar: \`pesos.append(0.5)\`

---

## 💻 Programa completo

\`\`\`python
# leccion_03_listas.py
# Listas: agrupando datos para nuestra neurona

# Neurona con listas (en vez de variables sueltas)
entradas = [0.5, 0.3, 0.7, 0.2]
pesos = [0.8, 0.6, 0.3, 0.9]
sesgo = 0.1

# Calcular salida: sumar cada entrada * su peso
suma = 0
for i in range(len(entradas)):
    producto = entradas[i] * pesos[i]
    suma = suma + producto
    print(f"  entrada[{i}]={entradas[i]} × peso[{i}]={pesos[i]} = {producto:.2f}")

salida = suma + sesgo
print(f"\\nSuma de productos: {suma:.2f}")
print(f"+ sesgo: {sesgo}")
print(f"= Salida final: {salida:.2f}")

# Operaciones con listas
print("\\n=== OPERACIONES CON LISTAS ===")
print("Total de pesos:", len(pesos))
print("Primer peso:", pesos[0])
print("Último peso:", pesos[-1])

# Agregar un nuevo peso
pesos.append(0.4)
print("Después de append:", pesos)

# Datos reales: temperaturas para el ejemplo celsius/fahrenheit
celsius = [-40, -10, 0, 8, 15, 22, 38]
fahrenheit = [-40, 14, 32, 46, 59, 72, 100]
print("\\n=== DATOS DE ENTRENAMIENTO ===")
print(f"Tenemos {len(celsius)} pares de datos")
for i in range(len(celsius)):
    print(f"  {celsius[i]}°C = {fahrenheit[i]}°F")
\`\`\`

---

## 🔍 Explicación línea por línea

- **\`entradas = [0.5, 0.3, 0.7, 0.2]\`:** Crea una lista con 4 valores decimales.
- **\`for i in range(len(entradas))\`:** \`len()\` devuelve 4. \`range(4)\` genera 0,1,2,3. El bucle \`for\` repite el bloque para cada valor.
- **\`entradas[i] * pesos[i]\`:** Accede al elemento en posición \`i\` de cada lista y los multiplica.
- **\`suma = suma + producto\`:** Acumula los productos. Este patrón se llama **acumulador**.
- **\`pesos[-1]\`:** Índice negativo: -1 es el último elemento, -2 el penúltimo, etc.
- **\`pesos.append(0.4)\`:** Agrega un valor al final de la lista. La lista crece dinámicamente.
- **\`f"...{celsius[i]}°C..."\`:** f-string combinada con acceso a lista por índice.

---

## 📊 Visualización

\`\`\`
LISTA: entradas = [0.5, 0.3, 0.7, 0.2]

Índice:    0     1     2     3
         ┌─────┬─────┬─────┬─────┐
Valor:   │ 0.5 │ 0.3 │ 0.7 │ 0.2 │
         └─────┴─────┴─────┴─────┘

CÁLCULO DE LA NEURONA CON LISTAS:
  entradas[0] × pesos[0] = 0.5 × 0.8 = 0.40
  entradas[1] × pesos[1] = 0.3 × 0.6 = 0.18
  entradas[2] × pesos[2] = 0.7 × 0.3 = 0.21
  entradas[3] × pesos[3] = 0.2 × 0.9 = 0.18
                                        ─────
                           Suma:        0.97
                           + sesgo:     0.10
                           = Salida:    1.07
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: Índice fuera de rango
\`\`\`python
datos = [10, 20, 30]
print(datos[3])  # La lista tiene índices 0, 1, 2...
\`\`\`
> **Predice:** ¿Qué error aparece? ¿Por qué el índice 3 no existe en una lista de 3 elementos?

### Experimento 2: Listas de tipos mixtos
\`\`\`python
mezcla = [1, "hola", 3.14, True]
print(mezcla)
print(type(mezcla[0]), type(mezcla[1]))
\`\`\`
> **Pregunta:** ¿Python permite mezclar tipos? ¿Es buena idea en IA?

### Experimento 3: Slicing
\`\`\`python
numeros = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
print(numeros[2:5])
print(numeros[:3])
print(numeros[7:])
print(numeros[::2])
\`\`\`
> **Predice cada resultado.** El slicing es fundamental para dividir datasets.

### Experimento 4: Lista de listas
\`\`\`python
matriz = [[1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]]
print(matriz[1][2])
\`\`\`
> **Predice:** ¿Qué número imprime? Pista: primero fila, luego columna.

### Experimento 5: Producto punto manual
\`\`\`python
a = [1, 2, 3]
b = [4, 5, 6]
resultado = 0
for i in range(len(a)):
    resultado += a[i] * b[i]
print("Producto punto:", resultado)
\`\`\`
> **Calcula a mano:** 1×4 + 2×5 + 3×6 = ? Esta operación es la más importante en IA.

---

## ⚠️ Errores comunes

**Error 1: Índice empieza en 0, no en 1**
\`\`\`python
datos = [10, 20, 30]
print(datos[1])  # Imprime 20, NO 10
\`\`\`

**Error 2: IndexError**
\`\`\`python
datos = [10, 20, 30]
print(datos[3])  # ❌ Solo existe 0, 1, 2
\`\`\`

**Error 3: Confundir largo con último índice**
\`\`\`python
datos = [10, 20, 30]
print(len(datos))  # 3
print(datos[2])    # Último elemento (no datos[3])
\`\`\`

---

## 🏆 Desafío

Crea una neurona con **5 entradas** y **5 pesos** usando listas. Calcula la salida con un bucle \`for\`. Luego modifica SOLO el peso en la posición 2 y recalcula. Imprime ambas salidas y la diferencia entre ellas.

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| Lista | Colección ordenada: \`[1, 2, 3]\` |
| Índice | Posición desde 0: \`lista[0]\` |
| \`len()\` | Número de elementos |
| \`append()\` | Agregar al final |
| Slicing | Extraer subconjuntos: \`lista[2:5]\` |
| Producto punto | Multiplicar par a par y sumar |

---

## 🧠 ¿Qué aprendimos realmente?

Las listas nos permiten representar **datos reales**: temperaturas, píxeles, pesos de una neurona. El cálculo que hicimos (multiplicar dos listas elemento a elemento y sumar) se llama **producto punto** y es la operación más ejecutada en toda la IA. Cada vez que le preguntas algo a ChatGPT, se ejecutan miles de millones de productos punto.

---

## ➡️ ¿Qué aprenderemos después?

Calcular el producto punto con un bucle \`for\` funciona, pero es **lento**. Con listas de un millón de elementos, Python sufre. En la próxima lección aprenderemos **NumPy**, una biblioteca que hace estas operaciones **100 veces más rápido** usando código optimizado en C. NumPy introduce el concepto de **array**, que es la base de los tensores.
`
  },
  {
    title: "NumPy - Matemáticas a Velocidad de la Luz",
    excerpt: "NumPy transforma listas lentas en arrays ultrarrápidos. Es la base de toda la computación numérica en IA.",
    content: `# Lección 4: NumPy — Matemáticas a Velocidad de la Luz

## 🎯 Objetivo de aprendizaje

**Una sola idea:** NumPy es una biblioteca que permite hacer operaciones matemáticas sobre **colecciones de números** de forma extremadamente rápida, sin necesidad de bucles.

---

## ¿Por qué existe este concepto?

En la lección anterior calculamos el producto punto con un bucle:
\`\`\`python
for i in range(len(entradas)):
    suma += entradas[i] * pesos[i]
\`\`\`

Esto funciona, pero Python ejecuta cada iteración una por una. Con un millón de pesos, tarda segundos. Una GPU moderna necesita hacer esta operación miles de millones de veces por segundo.

**NumPy** resuelve esto: en vez de procesar número por número, procesa **todos los números a la vez** (operaciones vectorizadas). Internamente usa código en C y Fortran altamente optimizado.

---

## Explicación intuitiva

Imagina que tienes que sumar 1000 pares de números:

- **Con bucle (listas):** Un contador humano lee el primer par, suma, anota, lee el segundo par, suma, anota... uno por uno. Lento.
- **Con NumPy:** 1000 calculadoras trabajan simultáneamente, cada una suma un par. Resultado instantáneo.

Esto se llama **paralelismo** y es la razón por la cual la IA moderna es posible.

---

## Explicación técnica

Un **array de NumPy** (\`ndarray\`) es similar a una lista, pero con restricciones que lo hacen rápido:
- Todos los elementos son del **mismo tipo** (usualmente \`float64\`)
- Tamaño fijo en memoria (no crece dinámicamente como una lista)
- Soporta **operaciones vectorizadas**: aplicar una operación a todos los elementos sin bucle

**Importar NumPy** se hace por convención así:
\`\`\`python
import numpy as np
\`\`\`

---

## 💻 Programa completo

\`\`\`python
# leccion_04_numpy.py
# NumPy: de bucles lentos a operaciones instantáneas

import numpy as np

# Crear arrays (equivalentes a nuestras listas)
entradas = np.array([0.5, 0.3, 0.7, 0.2])
pesos = np.array([0.8, 0.6, 0.3, 0.9])
sesgo = 0.1

# Producto punto: UNA LÍNEA en vez de un bucle
salida = np.dot(entradas, pesos) + sesgo
print("Salida de la neurona:", salida)

# Operaciones vectorizadas
print("\\n=== OPERACIONES VECTORIZADAS ===")
print("entradas × 2   =", entradas * 2)
print("entradas + 0.1 =", entradas + 0.1)
print("entradas ** 2  =", entradas ** 2)

# Comparar con el ejemplo celsius/fahrenheit
celsius = np.array([-40, -10, 0, 8, 15, 22, 38], dtype=float)
fahrenheit = np.array([-40, 14, 32, 46, 59, 72, 100], dtype=float)

# Funciones estadísticas
print("\\n=== ESTADÍSTICAS ===")
print(f"Celsius  → min: {celsius.min()}, max: {celsius.max()}, promedio: {celsius.mean():.1f}")
print(f"Fahrenheit → min: {fahrenheit.min()}, max: {fahrenheit.max()}")

# Forma (shape) — concepto CLAVE para IA
print("\\n=== SHAPE (FORMA) ===")
print("Forma de celsius:", celsius.shape)
vector = np.array([1, 2, 3])
matriz = np.array([[1, 2, 3],
                    [4, 5, 6]])
print("Vector shape:", vector.shape)     # (3,)
print("Matriz shape:", matriz.shape)     # (2, 3)
print("Matriz:\\n", matriz)
\`\`\`

---

## 🔍 Explicación línea por línea

- **\`import numpy as np\`:** Importa NumPy y le da el alias \`np\`. Convención universal.
- **\`np.array([...])\`:** Convierte una lista de Python en un array de NumPy.
- **\`np.dot(entradas, pesos)\`:** Producto punto en una sola operación optimizada.
- **\`entradas * 2\`:** Multiplica TODOS los elementos por 2, sin bucle. Esto se llama **broadcasting**.
- **\`dtype=float\`:** Especifica que los elementos son decimales de 64 bits.
- **\`celsius.min()\`, \`.max()\`, \`.mean()\`:** Funciones estadísticas integradas.
- **\`.shape\`:** Propiedad que dice las dimensiones del array. Un vector de 7 elementos tiene shape \`(7,)\`. Una matriz 2×3 tiene shape \`(2, 3)\`. **En IA, los errores de shape son los más comunes.**

---

## 📊 Visualización

\`\`\`
LISTA DE PYTHON vs ARRAY DE NUMPY:

Lista:  [0.5, 0.3, 0.7, 0.2]   ← cada elemento es un objeto Python
Array:  [0.5  0.3  0.7  0.2]   ← bloque continuo de memoria optimizado

PRODUCTO PUNTO:
  Con bucle (lento):              Con NumPy (rápido):
  suma = 0                        np.dot(entradas, pesos)
  for i in range(4):              → calcula todo de golpe
    suma += e[i] * p[i]

SHAPE — LA FORMA DE LOS DATOS:
  Escalar:  42              shape: ()
  Vector:   [1, 2, 3]      shape: (3,)
  Matriz:   [[1, 2, 3],    shape: (2, 3)    ← 2 filas, 3 columnas
              [4, 5, 6]]
  Tensor 3D:                shape: (2, 3, 4) ← profundidad, filas, columnas
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: Velocidad
\`\`\`python
import numpy as np
import time

n = 1_000_000
lista_a = list(range(n))
lista_b = list(range(n))
array_a = np.arange(n)
array_b = np.arange(n)

t1 = time.time()
sum(x*y for x,y in zip(lista_a, lista_b))
t2 = time.time()
print(f"Lista: {t2-t1:.4f} segundos")

t1 = time.time()
np.dot(array_a, array_b)
t2 = time.time()
print(f"NumPy: {t2-t1:.4f} segundos")
\`\`\`
> **Observa:** ¿Cuántas veces más rápido es NumPy?

### Experimento 2: Broadcasting
\`\`\`python
a = np.array([1, 2, 3])
print(a + 10)
print(a * a)
print(a > 2)
\`\`\`
> **Predice cada resultado.** ¿Qué devuelve \`a > 2\`?

### Experimento 3: Shapes incompatibles
\`\`\`python
a = np.array([1, 2, 3])
b = np.array([1, 2])
print(a + b)
\`\`\`
> **Predice:** ¿Funciona? Si no, ¿qué error aparece?

### Experimento 4: Crear arrays especiales
\`\`\`python
print(np.zeros(5))
print(np.ones(3))
print(np.random.randn(4))
print(np.arange(0, 1, 0.2))
\`\`\`
> **Observa:** ¿Para qué crees que se usan \`zeros\`, \`ones\` y \`random\` en IA?

### Experimento 5: Reshape
\`\`\`python
datos = np.arange(12)
print("Original:", datos, "shape:", datos.shape)
matriz = datos.reshape(3, 4)
print("Reshape(3,4):\\n", matriz, "shape:", matriz.shape)
matriz2 = datos.reshape(4, 3)
print("Reshape(4,3):\\n", matriz2)
\`\`\`
> **Pregunta:** ¿Por qué \`reshape(3,5)\` daría error con 12 elementos?

---

## ⚠️ Errores comunes

**Error 1: Shape mismatch**
\`\`\`python
a = np.array([1, 2, 3])
b = np.array([1, 2])
a + b  # ❌ ValueError: shapes (3,) and (2,) not aligned
\`\`\`

**Error 2: Olvidar importar NumPy**
\`\`\`python
datos = np.array([1, 2, 3])  # ❌ NameError: name 'np' is not defined
import numpy as np            # Siempre al inicio del archivo
\`\`\`

**Error 3: Confundir lista con array**
\`\`\`python
lista = [1, 2, 3]
print(lista * 2)      # [1, 2, 3, 1, 2, 3]  ← repite la lista
arr = np.array([1,2,3])
print(arr * 2)         # [2 4 6]  ← multiplica cada elemento
\`\`\`

---

## 🏆 Desafío

Crea dos arrays NumPy: uno con 5 calificaciones (0-100) y otro con 5 pesos que representen la importancia de cada evaluación (deben sumar 1.0). Calcula la nota final ponderada usando \`np.dot()\`. Luego encuentra la calificación más alta y más baja usando funciones de NumPy.

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| \`import numpy as np\` | Importar con alias estándar |
| \`np.array()\` | Crear array desde lista |
| \`np.dot()\` | Producto punto optimizado |
| Vectorización | Operar sobre todos los elementos sin bucle |
| \`.shape\` | Dimensiones del array |
| Broadcasting | Operar array con escalar automáticamente |
| \`.reshape()\` | Cambiar la forma sin cambiar los datos |

---

## 🧠 ¿Qué aprendimos realmente?

NumPy convierte las matemáticas de "lento y tedioso" a "instantáneo y elegante". El producto punto que en la Lección 3 requirió un bucle, ahora es una línea. Pero lo más importante es el concepto de **shape**: la forma de los datos. En IA, el 80% de los bugs son errores de shape — dos tensores que no tienen las dimensiones correctas para operar juntos.

---

## ➡️ ¿Qué aprenderemos después?

Ya sabemos calcular la salida de una neurona. Pero hasta ahora usamos valores inventados para los pesos. ¿Cómo encuentra la máquina los pesos correctos? En la próxima lección aprenderemos sobre **funciones**, que nos permitirán encapsular el cálculo de la neurona y reutilizarlo. Las funciones son piezas de código reutilizables que reciben datos y devuelven resultados.
`
  }
]
