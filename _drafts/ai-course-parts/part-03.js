// Part 3: Lessons 5-6
export default [
  {
    title: "Funciones - Empaquetando Lógica Reutilizable",
    excerpt: "Las funciones encapsulan operaciones en bloques reutilizables. En IA, cada capa de una red neuronal es una función.",
    content: `# Lección 5: Funciones — Empaquetando Lógica Reutilizable

## 🎯 Objetivo de aprendizaje

**Una sola idea:** Una función es un **bloque de código con nombre** que recibe datos (parámetros), los procesa y devuelve un resultado.

---

## ¿Por qué existe este concepto?

En las lecciones anteriores, calculamos la neurona así:
\`\`\`python
salida = np.dot(entradas, pesos) + sesgo
\`\`\`

Si queremos probar con diferentes entradas, copiamos y pegamos esa línea. Si queremos 100 neuronas, la copiamos 100 veces. Si descubrimos un error, lo corregimos en 100 lugares.

Las **funciones** resuelven esto: defines el cálculo una vez, y lo llamas las veces que quieras.

En IA, una red neuronal es literalmente una **composición de funciones**: la salida de una función alimenta la entrada de la siguiente.

---

## Explicación intuitiva

Piensa en una **máquina expendedora**:
- Metes monedas (entradas/parámetros)
- La máquina procesa internamente (cuerpo de la función)
- Sale tu producto (valor de retorno)

No necesitas saber cómo funciona por dentro. Solo necesitas saber: ¿qué le meto y qué me devuelve?

---

## Explicación técnica

En Python, una función se define con \`def\`:
\`\`\`python
def nombre_funcion(parametro1, parametro2):
    # cuerpo: las instrucciones
    resultado = parametro1 + parametro2
    return resultado  # valor que devuelve
\`\`\`

- **\`def\`**: palabra clave que inicia la definición
- **Parámetros**: variables que recibe la función
- **\`return\`**: devuelve un valor al código que llamó la función
- **Indentación**: el cuerpo debe estar indentado (4 espacios)

---

## 💻 Programa completo

\`\`\`python
# leccion_05_funciones.py
# Funciones: encapsulando nuestra neurona

import numpy as np

def neurona(entradas, pesos, sesgo):
    """Calcula la salida de una neurona artificial."""
    return np.dot(entradas, pesos) + sesgo

# Probar con diferentes datos (¡sin copiar código!)
print("=== NEURONA REUTILIZABLE ===")
e1 = np.array([0.5, 0.3, 0.7])
p1 = np.array([0.8, 0.6, 0.3])
print("Prueba 1:", neurona(e1, p1, 0.1))

e2 = np.array([1.0, 0.0, 0.5])
print("Prueba 2:", neurona(e2, p1, 0.1))

e3 = np.array([0.0, 0.0, 0.0])
print("Prueba 3:", neurona(e3, p1, 0.1))

# Función con valor por defecto
def neurona_v2(entradas, pesos, sesgo=0.0):
    """Neurona con sesgo opcional (por defecto 0)."""
    return np.dot(entradas, pesos) + sesgo

print("\\nSin sesgo:", neurona_v2(e1, p1))
print("Con sesgo:", neurona_v2(e1, p1, 0.5))

# Función que devuelve múltiples valores
def analizar_datos(datos):
    """Devuelve estadísticas básicas de un array."""
    return datos.min(), datos.max(), datos.mean(), datos.std()

valores = np.array([4, 8, 15, 16, 23, 42])
minimo, maximo, promedio, desviacion = analizar_datos(valores)
print(f"\\nMin={minimo} Max={maximo} Prom={promedio:.1f} Std={desviacion:.1f}")

# Composición: funciones que llaman funciones
def capa_neuronal(entradas, pesos_capa, sesgos_capa):
    """Capa completa: múltiples neuronas procesando las mismas entradas."""
    salidas = []
    for i in range(len(sesgos_capa)):
        s = neurona(entradas, pesos_capa[i], sesgos_capa[i])
        salidas.append(s)
    return np.array(salidas)

pesos_c = np.array([[0.2, 0.4, 0.6],
                     [0.7, 0.1, 0.3],
                     [0.5, 0.5, 0.5]])
sesgos_c = np.array([0.1, 0.2, 0.3])

print("\\n=== CAPA DE 3 NEURONAS ===")
resultado = capa_neuronal(e1, pesos_c, sesgos_c)
print("Salidas de la capa:", resultado)
\`\`\`

---

## 🔍 Explicación línea por línea

- **\`def neurona(entradas, pesos, sesgo):\`** — Define una función llamada \`neurona\` que acepta 3 parámetros.
- **\`"""Calcula..."""\`** — Docstring: documentación de la función. Buena práctica.
- **\`return np.dot(...) + sesgo\`** — Calcula y devuelve el resultado inmediatamente.
- **\`neurona(e1, p1, 0.1)\`** — Llama la función pasando valores concretos (argumentos).
- **\`sesgo=0.0\`** — Parámetro con valor por defecto. Si no lo pasas, usa 0.
- **\`return datos.min(), datos.max(), ...\`** — Python permite retornar múltiples valores como tupla.
- **\`capa_neuronal\`** — Una función que llama a \`neurona\` múltiples veces. Esto es **composición**.

---

## 📊 Visualización

\`\`\`
FUNCIÓN COMO CAJA NEGRA:
        ┌──────────────────────┐
entradas ──►│                      │
pesos   ──►│   neurona(e, p, s)   │──► salida
sesgo   ──►│                      │
        └──────────────────────┘

CAPA NEURONAL = MÚLTIPLES NEURONAS:
        ┌─────────────┐
     ──►│  neurona 0   │──► salida[0]
Mismas  ├─────────────┤
entradas──►│  neurona 1   │──► salida[1]
     ──►├─────────────┤
     ──►│  neurona 2   │──► salida[2]
        └─────────────┘
  (cada una con sus propios pesos y sesgo)
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: ¿Qué pasa sin return?
\`\`\`python
def sumar(a, b):
    resultado = a + b
    # Sin return

x = sumar(3, 4)
print(x)
\`\`\`
> **Predice:** ¿Qué imprime? ¿Por qué?

### Experimento 2: Parámetros por nombre
\`\`\`python
def describir(nombre, edad, ciudad="Desconocida"):
    print(f"{nombre}, {edad} años, de {ciudad}")

describir("Ana", 25)
describir("Luis", 30, "Santiago")
describir(edad=22, nombre="Pedro")
\`\`\`
> **Observa:** ¿Puedes cambiar el orden de los parámetros?

### Experimento 3: Variables locales vs globales
\`\`\`python
x = 100
def modificar():
    x = 999
    print("Dentro:", x)

modificar()
print("Fuera:", x)
\`\`\`
> **Predice:** ¿\`x\` cambia fuera de la función?

### Experimento 4: Función recursiva
\`\`\`python
def cuenta_regresiva(n):
    print(n)
    if n > 0:
        cuenta_regresiva(n - 1)

cuenta_regresiva(5)
\`\`\`
> **Observa:** La función se llama a sí misma. ¿Qué pasaría sin el \`if n > 0\`?

### Experimento 5: Lambda (función anónima)
\`\`\`python
duplicar = lambda x: x * 2
print(duplicar(5))
print(duplicar(21))
\`\`\`
> **Pregunta:** ¿Cuándo usarías \`lambda\` en vez de \`def\`?

---

## ⚠️ Errores comunes

**Error 1: Olvidar los paréntesis al llamar**
\`\`\`python
print(neurona)   # ❌ Imprime el objeto función, no el resultado
print(neurona(e1, p1, 0.1))  # ✅ Llama la función
\`\`\`

**Error 2: Indentación incorrecta**
\`\`\`python
def sumar(a, b):
return a + b  # ❌ IndentationError
\`\`\`

**Error 3: Modificar una lista dentro de una función**
\`\`\`python
def agregar(lista):
    lista.append(999)

datos = [1, 2, 3]
agregar(datos)
print(datos)  # [1, 2, 3, 999] — ¡La original cambió!
\`\`\`

---

## 🏆 Desafío

Crea una función \`red_neuronal(entradas, capas)\` donde \`capas\` sea una lista de diccionarios, cada uno con \`"pesos"\` y \`"sesgo"\`. La función debe pasar las entradas por cada capa secuencialmente (la salida de una capa es la entrada de la siguiente). Pruébala con al menos 2 capas.

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| \`def\` | Define una función |
| Parámetros | Variables de entrada |
| \`return\` | Devuelve un valor |
| Valor por defecto | \`param=valor\` |
| Docstring | \`"""documentación"""\` |
| Composición | Funciones que llaman funciones |

---

## 🧠 ¿Qué aprendimos realmente?

Las funciones son la base de la organización en programación. En IA, todo es composición de funciones: una red neuronal es una función que contiene capas, cada capa es una función que contiene neuronas, y cada neurona es una función que hace un producto punto + sesgo. Cuando veas \`model(x)\` en PyTorch, es simplemente una llamada a función.

---

## ➡️ ¿Qué aprenderemos después?

Nuestra neurona calcula un producto punto + sesgo y devuelve el resultado directamente. Pero las neuronas reales necesitan decidir si "activarse" o no, como una neurona biológica que dispara o no. En la próxima lección aprenderemos las **funciones de activación**, que transforman la salida lineal en algo más útil.
`
  },
  {
    title: "Funciones de Activación - El Interruptor de la Neurona",
    excerpt: "Las funciones de activación deciden si una neurona se activa o no. Sin ellas, una red neuronal sería solo una multiplicación gigante.",
    content: `# Lección 6: Funciones de Activación — El Interruptor de la Neurona

## 🎯 Objetivo de aprendizaje

**Una sola idea:** Una función de activación transforma la salida lineal de una neurona en una salida **no lineal**, permitiendo a la red aprender patrones complejos.

---

## ¿Por qué existe este concepto?

Hasta ahora nuestra neurona calcula:
\`\`\`
salida = dot(entradas, pesos) + sesgo
\`\`\`

Esto es una **función lineal**: una recta. Si apilas 100 capas lineales, el resultado es... otra recta. Es como multiplicar: 2 × 3 × 4 = 24. No importa cuántas multiplicaciones hagas, el resultado es un solo número.

El mundo real NO es lineal. ¿Es este email spam? ¿Este tumor es maligno? ¿Qué emoción transmite esta cara? Las respuestas no siguen líneas rectas.

Las **funciones de activación** doblan, curvan y comprimen la salida, permitiendo a la red modelar relaciones complejas.

---

## Explicación intuitiva

Piensa en un **termostato**:
- La entrada es la temperatura (número continuo)
- Sin activación: reporta el número directamente (20.5°C, 22.3°C, -5.1°C)
- Con activación tipo **escalón**: reporta solo ON/OFF (caliente o frío)
- Con activación tipo **sigmoide**: reporta una probabilidad (83% de que haga calor)
- Con activación tipo **ReLU**: reporta el valor si es positivo, 0 si es negativo

---

## Explicación técnica

Una **función de activación** se aplica DESPUÉS del cálculo lineal:
\`\`\`
z = dot(entradas, pesos) + sesgo    ← valor lineal
a = activación(z)                   ← valor activado
\`\`\`

Las más importantes:

| Función | Fórmula | Rango | Uso principal |
|---------|---------|-------|---------------|
| ReLU | \`max(0, z)\` | [0, ∞) | Capas ocultas (la más usada) |
| Sigmoid | \`1 / (1 + e^(-z))\` | (0, 1) | Probabilidad binaria |
| Tanh | \`(e^z - e^(-z)) / (e^z + e^(-z))\` | (-1, 1) | Datos centrados en 0 |

**ReLU** (Rectified Linear Unit) es la estrella moderna:
- Si el valor es positivo → lo deja pasar
- Si es negativo → lo convierte en 0
- Rápida, simple y funciona increíblemente bien

---

## 💻 Programa completo

\`\`\`python
# leccion_06_activacion.py
# Funciones de activación: el elemento no lineal

import numpy as np

# Definir las funciones de activación
def relu(z):
    """ReLU: deja pasar positivos, bloquea negativos."""
    return np.maximum(0, z)

def sigmoid(z):
    """Sigmoid: comprime cualquier número al rango (0, 1)."""
    return 1 / (1 + np.exp(-z))

def tanh_act(z):
    """Tanh: comprime al rango (-1, 1)."""
    return np.tanh(z)

# Nuestra neurona COMPLETA (con activación)
def neurona_completa(entradas, pesos, sesgo, activacion=relu):
    """Neurona: producto punto + sesgo + activación."""
    z = np.dot(entradas, pesos) + sesgo
    a = activacion(z)
    return z, a  # Retorna ambos para comparar

# Probar con datos
entradas = np.array([0.5, -0.3, 0.7])
pesos = np.array([0.8, 0.6, -0.9])
sesgo = 0.1

z, a = neurona_completa(entradas, pesos, sesgo, relu)
print(f"ReLU:    z={z:.3f}  →  a={a:.3f}")

z, a = neurona_completa(entradas, pesos, sesgo, sigmoid)
print(f"Sigmoid: z={z:.3f}  →  a={a:.3f}")

z, a = neurona_completa(entradas, pesos, sesgo, tanh_act)
print(f"Tanh:    z={z:.3f}  →  a={a:.3f}")

# Visualizar ReLU sobre un rango
print("\\n=== TABLA ReLU ===")
valores = np.array([-3, -2, -1, -0.5, 0, 0.5, 1, 2, 3])
print("Entrada  →  ReLU")
for v in valores:
    r = relu(v)
    barra = "█" * int(r * 5) if r > 0 else ""
    print(f"  {v:5.1f}  →  {r:4.1f}  {barra}")

# ¿Por qué importa la no linealidad?
print("\\n=== SIN vs CON ACTIVACIÓN ===")
# Dos capas lineales sin activación = una sola capa lineal
W1, W2 = 3, 4
x = 2
print(f"Capa1(Capa2(x)) = {W1} * ({W2} * {x}) = {W1 * W2 * x}")
print(f"Equivalente:     = {W1 * W2} * {x} = {W1 * W2 * x}")
print("¡Son iguales! Dos capas lineales = una sola capa.")
print("Con ReLU: resultado diferente porque ReLU dobla la recta.")
\`\`\`

---

## 🔍 Explicación línea por línea

- **\`np.maximum(0, z)\`:** Compara \`z\` con 0 y devuelve el mayor. Si \`z\` es array, opera elemento a elemento.
- **\`np.exp(-z)\`:** Exponencial de \`-z\` (e^(-z)). Usado en sigmoid para comprimir valores.
- **\`activacion=relu\`:** Parámetro que recibe una función. En Python, las funciones son valores que puedes pasar como argumento.
- **\`return z, a\`:** Retorna la pre-activación (z) y la activación (a) para comparar.
- **\`"█" * int(r * 5)\`:** Crea una barra visual proporcional al valor activado.

---

## 📊 Visualización

\`\`\`
ReLU: f(z) = max(0, z)          Sigmoid: f(z) = 1/(1+e^(-z))
     │                               │ 1.0 ─ ─ ─ ─ ─ ─ ─ ─ ╱─
     │           ╱                    │                    ╱
     │         ╱                      │ 0.5 ─ ─ ─ ─ ─ ╱
     │       ╱                        │              ╱
─────┼─────╱──────                    │           ╱
     │   0                       ─────┤─ ─ ─ ╱─────────────
     │                                │ 0.0
    -3  -2  -1  0  1  2  3          -6     0     6

NEURONA COMPLETA:
  entradas ──► [producto punto + sesgo] ──► [ACTIVACIÓN] ──► salida
                    z = 0.17                 ReLU(0.17)      a = 0.17
                                             Sigmoid(0.17)   a = 0.54
                                             Tanh(0.17)      a = 0.17
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: ReLU con negativos
\`\`\`python
valores = np.array([-5, -1, 0, 1, 5])
print("ReLU:", relu(valores))
\`\`\`
> **Predice:** ¿Qué pasa con los negativos? ¿Qué significa "perder" información negativa?

### Experimento 2: Sigmoid como probabilidad
\`\`\`python
print(sigmoid(-10))
print(sigmoid(0))
print(sigmoid(10))
print(sigmoid(100))
\`\`\`
> **Observa:** ¿Alguna vez llega exactamente a 0 o 1? ¿Qué valor da sigmoid(0)?

### Experimento 3: Saturación
\`\`\`python
print(f"sigmoid(5) = {sigmoid(5):.10f}")
print(f"sigmoid(10) = {sigmoid(10):.10f}")
print(f"sigmoid(50) = {sigmoid(50):.10f}")
\`\`\`
> **Observa:** Los valores se vuelven casi idénticos. ¿Por qué esto es un problema para el entrenamiento?

### Experimento 4: Sin activación = lineal
\`\`\`python
# Dos capas sin activación
W1 = np.array([[2, 3], [4, 5]])
W2 = np.array([[1, 0], [0, 1]])
x = np.array([1, 1])
capa1 = W1 @ x
capa2 = W2 @ capa1
directo = (W2 @ W1) @ x
print("Dos capas:", capa2)
print("Directo:", directo)  # ¡Iguales!
\`\`\`
> **Conclusión:** Sin activación, las capas se colapsan. Escribe con tus palabras por qué.

### Experimento 5: ReLU vs Sigmoid en una red
\`\`\`python
datos = np.linspace(-5, 5, 11)
print("Dato     ReLU   Sigmoid")
for d in datos:
    print(f"{d:6.1f}  {relu(d):6.2f}  {sigmoid(d):7.4f}")
\`\`\`
> **Compara:** ¿Cuál crece sin límite? ¿Cuál está siempre acotada?

---

## ⚠️ Errores comunes

**Error 1: Usar \`max\` en vez de \`np.maximum\`**
\`\`\`python
# ❌ max() de Python no funciona con arrays
relu_mal = lambda z: max(0, z)

# ✅ np.maximum() opera elemento a elemento
relu_bien = lambda z: np.maximum(0, z)
\`\`\`

**Error 2: Overflow en exp**
\`\`\`python
# ❌ np.exp(1000) = inf → genera NaN
sigmoid(1000)  # Puede dar warning

# ✅ Implementación estable
def sigmoid_estable(z):
    return np.where(z >= 0, 1/(1+np.exp(-z)), np.exp(z)/(1+np.exp(z)))
\`\`\`

---

## 🏆 Desafío

Crea una función \`red_dos_capas(x, W1, b1, W2, b2)\` que:
1. Calcule la primera capa con ReLU
2. Pase el resultado a la segunda capa con Sigmoid
3. Devuelva la predicción final

Pruébala con datos de tu elección y explica por qué la salida siempre está entre 0 y 1.

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| Linealidad | Funciones que solo multiplican y suman |
| No linealidad | Funciones que curvan/comprimen |
| ReLU | \`max(0, z)\` — la más usada en capas ocultas |
| Sigmoid | Comprime a (0,1) — ideal para probabilidades |
| Saturación | Cuando sigmoid da casi 0 o casi 1, deja de aprender |

---

## 🧠 ¿Qué aprendimos realmente?

Sin funciones de activación, una red neuronal profunda es matemáticamente equivalente a una sola capa. Las activaciones son lo que hace "profundo" al deep learning. ReLU es la más popular porque es simple, rápida y evita el problema de saturación de sigmoid/tanh. Ahora nuestra neurona está completa: entrada → producto punto + sesgo → activación → salida.

---

## ➡️ ¿Qué aprenderemos después?

Tenemos una neurona completa, pero ¿cómo aprende? Necesitamos medir qué tan equivocada está (función de pérdida/loss) y luego ajustar los pesos para reducir ese error. En la próxima lección aprenderemos sobre **funciones de pérdida**, el "profesor" que le dice a la red cuánto se equivocó.
`
  }
]
