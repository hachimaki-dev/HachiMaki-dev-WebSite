// Part 4: Lessons 7-8
export default [
  {
    title: "Función de Pérdida - El Profesor de la Red",
    excerpt: "La función de pérdida mide qué tan equivocada está la predicción. Sin ella, la red no sabe si está mejorando o empeorando.",
    content: `# Lección 7: Función de Pérdida — El Profesor de la Red

## 🎯 Objetivo de aprendizaje

**Una sola idea:** Una función de pérdida (loss function) calcula un **número único** que mide la diferencia entre lo que la red predijo y la respuesta correcta. Cuanto menor sea ese número, mejor.

---

## ¿Por qué existe este concepto?

Nuestra neurona produce una salida, pero ¿cómo sabe si es correcta? Si predice 72°F para 22°C, está bien. Si predice 150°F, está terriblemente mal. Necesitamos un número que cuantifique el error.

Sin una función de pérdida, la red no tiene dirección: no sabe si sus pesos son buenos o malos, ni hacia dónde ajustarlos.

---

## Explicación intuitiva

Imagina un **juego de dardos**:
- El centro de la diana es la respuesta correcta
- Tu dardo es la predicción de la red
- La **distancia** entre tu dardo y el centro es la **pérdida**
- Tu objetivo es reducir esa distancia a cero

La función de pérdida es simplemente la regla que mide esa distancia.

---

## Explicación técnica

Las dos funciones de pérdida más fundamentales:

**1. Error Cuadrático Medio (MSE):**
\`\`\`
MSE = (1/n) × Σ(predicción - real)²
\`\`\`
Se eleva al cuadrado para: (a) que los errores negativos no cancelen los positivos, (b) penalizar más los errores grandes.

**2. Error Absoluto Medio (MAE):**
\`\`\`
MAE = (1/n) × Σ|predicción - real|
\`\`\`
Más simple y robusto a valores atípicos (outliers).

---

## 💻 Programa completo

\`\`\`python
# leccion_07_loss.py
# Funciones de pérdida: midiendo el error de nuestra red

import numpy as np

def mse(predicciones, reales):
    """Error Cuadrático Medio."""
    errores = predicciones - reales
    return np.mean(errores ** 2)

def mae(predicciones, reales):
    """Error Absoluto Medio."""
    return np.mean(np.abs(predicciones - reales))

# Datos: celsius → fahrenheit
celsius = np.array([-40, -10, 0, 8, 15, 22, 38], dtype=float)
fahrenheit = np.array([-40, 14, 32, 46, 59, 72, 100], dtype=float)

# Neurona simple: salida = entrada * peso + sesgo
# Intentemos adivinar los pesos
peso = 1.8
sesgo = 32.0
predicciones = celsius * peso + sesgo

# Calcular pérdida
print("=== PREDICCIONES ===")
print("Celsius | Real °F | Pred °F | Error")
print("-" * 45)
for i in range(len(celsius)):
    error = predicciones[i] - fahrenheit[i]
    print(f"  {celsius[i]:5.0f}  |  {fahrenheit[i]:5.0f}  |  {predicciones[i]:6.1f}  | {error:+.1f}")

print(f"\\nMSE: {mse(predicciones, fahrenheit):.2f}")
print(f"MAE: {mae(predicciones, fahrenheit):.2f}")

# Comparar con pesos incorrectos
print("\\n=== COMPARANDO PESOS ===")
intentos = [(1.0, 0.0), (1.5, 20.0), (1.8, 32.0), (2.0, 40.0)]
for p, s in intentos:
    pred = celsius * p + s
    loss = mse(pred, fahrenheit)
    print(f"  peso={p:.1f}, sesgo={s:5.1f} → MSE={loss:8.2f}")

# Búsqueda simple del mejor peso
print("\\n=== BUSCANDO EL MEJOR PESO ===")
mejor_loss = float('inf')
mejor_peso = 0
for p in np.arange(0.5, 3.0, 0.1):
    pred = celsius * p + 32
    loss = mse(pred, fahrenheit)
    if loss < mejor_loss:
        mejor_loss = loss
        mejor_peso = p
    print(f"  peso={p:.1f} → MSE={loss:7.2f}")

print(f"\\n✅ Mejor peso: {mejor_peso:.1f} (MSE={mejor_loss:.2f})")
print(f"   Fórmula real: F = C × 1.8 + 32")
\`\`\`

---

## 🔍 Explicación línea por línea

- **\`predicciones - reales\`:** Resta vectorizada. Calcula el error de cada predicción.
- **\`errores ** 2\`:** Eleva cada error al cuadrado (penaliza errores grandes).
- **\`np.mean()\`:** Promedia todos los errores cuadrados → un solo número.
- **\`np.abs()\`:** Valor absoluto, convierte negativos en positivos.
- **\`float('inf')\`:** Infinito positivo, usado como valor inicial para encontrar el mínimo.
- **\`np.arange(0.5, 3.0, 0.1)\`:** Genera valores de 0.5 a 3.0 en pasos de 0.1.
- La búsqueda prueba 25 valores de peso. No es eficiente (hay millones de combinaciones posibles), pero muestra la idea.

---

## 📊 Visualización

\`\`\`
FUNCIÓN DE PÉRDIDA = DISTANCIA AL OBJETIVO:

  peso=1.0  ────────────────────────────── MSE = 2500+ (muy lejos)
  peso=1.5  ──────────────── MSE = 500     (acercándose)
  peso=1.8  ──── MSE = 2.8                 (¡casi perfecto!)
  peso=2.0  ────────── MSE = 200           (se pasó)

PAISAJE DE LA PÉRDIDA (loss landscape):
  MSE
  │\\ 
  │ \\                    ╱
  │  \\                  ╱
  │   \\               ╱
  │    \\     ___     ╱
  │     \\__╱   \\___╱    ← mínimo (mejor peso)
  └──────────────────── peso
  0.5    1.0    1.5    2.0    2.5
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: MSE vs MAE
\`\`\`python
pred = np.array([10, 10, 10, 10, 100])
real = np.array([10, 10, 10, 10, 10])
print("MSE:", mse(pred, real))
print("MAE:", mae(pred, real))
\`\`\`
> **Observa:** Un solo error grande (100 vs 10). ¿Cuál métrica lo penaliza más? ¿Por qué?

### Experimento 2: Error perfecto
\`\`\`python
pred = np.array([1.0, 2.0, 3.0])
real = np.array([1.0, 2.0, 3.0])
print("MSE:", mse(pred, real))
\`\`\`
> **Pregunta:** ¿Cuál es el MSE cuando las predicciones son perfectas?

### Experimento 3: ¿Por qué al cuadrado?
\`\`\`python
errores = np.array([-5, 3, -2, 4])
print("Suma errores (se cancelan):", np.sum(errores))
print("Suma cuadrados (no cancelan):", np.sum(errores**2))
print("Suma absolutos (tampoco):", np.sum(np.abs(errores)))
\`\`\`
> **Explica:** ¿Por qué no podemos simplemente sumar los errores?

### Experimento 4: Búsqueda más fina
\`\`\`python
for p in np.arange(1.7, 1.9, 0.01):
    pred = celsius * p + 32
    print(f"peso={p:.2f} → MSE={mse(pred, fahrenheit):.4f}")
\`\`\`
> **Observa:** ¿Cuál es el peso óptimo con 2 decimales?

### Experimento 5: Dos parámetros
\`\`\`python
mejor = float('inf')
for p in np.arange(1.5, 2.1, 0.1):
    for s in np.arange(28, 36, 1):
        pred = celsius * p + s
        loss = mse(pred, fahrenheit)
        if loss < mejor:
            mejor = loss
            print(f"  ¡Mejor! peso={p:.1f} sesgo={s:.0f} MSE={loss:.2f}")
\`\`\`
> **Reflexión:** Con 2 parámetros ya probamos muchas combinaciones. ¿Es viable con millones?

---

## ⚠️ Errores comunes

**Error 1: No elevar al cuadrado**
\`\`\`python
# ❌ Los errores se cancelan
loss = np.mean(predicciones - reales)  # Podría dar ~0 siendo terrible

# ✅ MSE correcto
loss = np.mean((predicciones - reales) ** 2)
\`\`\`

**Error 2: Comparar pérdidas de diferente escala**
MSE de temperatura (valores ~100) será mucho mayor que MSE de probabilidad (valores ~0.5). No son directamente comparables.

---

## 🏆 Desafío

Implementa una función que reciba datos celsius/fahrenheit y encuentre automáticamente el mejor peso y sesgo probando combinaciones. Luego calcula cuántas combinaciones probaste y estima cuánto tardaría con 1000 parámetros. ¿Es práctico este método?

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| Loss function | Mide el error entre predicción y realidad |
| MSE | Media de errores al cuadrado — penaliza errores grandes |
| MAE | Media de errores absolutos — más robusta |
| Loss = 0 | Predicción perfecta |
| Búsqueda bruta | Probar combinaciones, no escala a muchos parámetros |

---

## 🧠 ¿Qué aprendimos realmente?

La función de pérdida convierte la pregunta cualitativa "¿qué tan bien predice?" en un número preciso. Este número es la brújula del entrenamiento: siempre queremos que baje. Pero descubrimos un problema: buscar los mejores pesos probando combinaciones es imposible cuando hay muchos parámetros.

---

## ➡️ ¿Qué aprenderemos después?

Necesitamos un método inteligente para encontrar los mejores pesos sin probar todas las combinaciones posibles. En la próxima lección aprenderemos el **gradiente** y la **derivada**: herramientas matemáticas que nos dicen exactamente en qué dirección mover cada peso para reducir la pérdida. Es como tener un mapa que señala cuesta abajo.
`
  },
  {
    title: "El Gradiente - La Brújula del Aprendizaje",
    excerpt: "El gradiente indica la dirección y magnitud del cambio necesario en cada peso para reducir el error. Es el corazón del aprendizaje automático.",
    content: `# Lección 8: El Gradiente — La Brújula del Aprendizaje

## 🎯 Objetivo de aprendizaje

**Una sola idea:** El **gradiente** es un vector que indica la dirección en la que la función de pérdida **crece más rápido**. Para minimizar la pérdida, caminamos en la dirección **opuesta** al gradiente.

---

## ¿Por qué existe este concepto?

En la lección anterior descubrimos que buscar los mejores pesos probando combinaciones es imposible: con 1000 parámetros y 100 valores por parámetro, tendríamos 100^1000 combinaciones (más que átomos en el universo).

El gradiente resuelve esto: en vez de probar todo, calcula la **pendiente** de la pérdida en el punto actual y te dice "mueve el peso en ESTA dirección para bajar".

---

## Explicación intuitiva

Imagina que estás en una **montaña con niebla** y quieres llegar al valle (pérdida mínima):
- No puedes ver el camino completo (demasiados parámetros)
- Pero puedes sentir la inclinación del suelo bajo tus pies
- Si el suelo baja hacia la izquierda → caminas a la izquierda
- Si baja hacia adelante → caminas hacia adelante

La **derivada** es la inclinación en una dimensión. El **gradiente** es la inclinación en TODAS las dimensiones simultáneamente.

---

## Explicación técnica

La **derivada** de una función f(x) en un punto mide cuánto cambia f cuando x cambia un poquito:

\`\`\`
derivada ≈ (f(x + h) - f(x)) / h    donde h es un número muy pequeño
\`\`\`

Si la derivada es:
- **Positiva**: la función sube → debemos RESTAR al parámetro
- **Negativa**: la función baja → debemos SUMAR al parámetro
- **Cero**: estamos en un mínimo (o máximo o punto de silla)

El **gradiente** es el vector de todas las derivadas parciales:
\`\`\`
gradiente = [∂L/∂w₁, ∂L/∂w₂, ..., ∂L/∂wₙ]
\`\`\`

---

## 💻 Programa completo

\`\`\`python
# leccion_08_gradiente.py
# El gradiente: aprendiendo la dirección correcta

import numpy as np

# Función de pérdida: MSE para y = wx + b
def loss(w, b, x, y_real):
    pred = w * x + b
    return np.mean((pred - y_real) ** 2)

# Derivada numérica (aproximación)
def derivada_numerica(f, x, h=1e-5):
    """Calcula la derivada de f en x usando diferencia finita."""
    return (f(x + h) - f(x - h)) / (2 * h)

# Datos
celsius = np.array([-40, -10, 0, 8, 15, 22, 38], dtype=float)
fahrenheit = np.array([-40, 14, 32, 46, 59, 72, 100], dtype=float)

# Gradiente respecto a w y b
w, b = 1.0, 0.0  # Valores iniciales (malos a propósito)

print("=== GRADIENTE PASO A PASO ===")
print(f"Inicio: w={w:.2f}, b={b:.2f}, Loss={loss(w, b, celsius, fahrenheit):.2f}")

# Calcular derivadas parciales numéricamente
h = 0.0001
dL_dw = (loss(w + h, b, celsius, fahrenheit) - loss(w - h, b, celsius, fahrenheit)) / (2 * h)
dL_db = (loss(w, b + h, celsius, fahrenheit) - loss(w, b - h, celsius, fahrenheit)) / (2 * h)
print(f"  ∂L/∂w = {dL_dw:.2f} (derivada respecto al peso)")
print(f"  ∂L/∂b = {dL_db:.2f} (derivada respecto al sesgo)")

# Descenso del gradiente: mover en dirección opuesta
tasa = 0.0001  # Learning rate (paso pequeño)

print(f"\\n=== ENTRENAMIENTO (30 pasos) ===")
for paso in range(30):
    # Calcular gradientes
    dL_dw = (loss(w+h, b, celsius, fahrenheit) - loss(w-h, b, celsius, fahrenheit)) / (2*h)
    dL_db = (loss(w, b+h, celsius, fahrenheit) - loss(w, b-h, celsius, fahrenheit)) / (2*h)
    
    # Actualizar parámetros (opuesto al gradiente)
    w = w - tasa * dL_dw
    b = b - tasa * dL_db
    
    if paso % 5 == 0 or paso == 29:
        l = loss(w, b, celsius, fahrenheit)
        print(f"  Paso {paso:2d}: w={w:.4f}, b={b:.4f}, Loss={l:.4f}")

print(f"\\n✅ Resultado: F = {w:.2f} × C + {b:.2f}")
print(f"   Real:      F = 1.80 × C + 32.00")
\`\`\`

---

## 🔍 Explicación línea por línea

- **\`loss(w + h, b, ...) - loss(w - h, b, ...)\`:** Mide cuánto cambia la pérdida cuando movemos \`w\` un poquito arriba y abajo. La diferencia dividida por \`2h\` es la derivada numérica.
- **\`tasa = 0.0001\`:** Learning rate. Controla el tamaño del paso. Muy grande = se pasa, muy pequeño = tarda siglos.
- **\`w = w - tasa * dL_dw\`:** La regla de actualización del descenso del gradiente. El signo menos invierte la dirección (vamos cuesta abajo, no arriba).
- **\`if paso % 5 == 0\`:** Imprime cada 5 pasos para no saturar la pantalla.

---

## 📊 Visualización

\`\`\`
DERIVADA = PENDIENTE DE LA CURVA:

  Loss                     Loss
  │\\                       │         ╱
  │ \\   derivada           │       ╱
  │  \\  negativa           │     ╱  derivada
  │   \\  (bajar)           │   ╱   positiva
  │    \\_____              │ ╱     (subir)
  └──────────── w          └──────────── w
  "mover w a la derecha"   "mover w a la izquierda"

DESCENSO DEL GRADIENTE:
  Loss
  │●                       ← inicio (w=1.0, loss alto)
  │ \\
  │  ●                     ← paso 5
  │   \\
  │    ●                   ← paso 10
  │     \\
  │      ●                 ← paso 15
  │       \\_____●          ← paso 30 (cerca del mínimo)
  └──────────────── w
       1.0  1.2  1.4  1.6  1.8
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: Learning rate muy grande
\`\`\`python
w, b = 1.0, 0.0
tasa = 0.01  # 100x más grande
for paso in range(10):
    dL_dw = (loss(w+h, b, celsius, fahrenheit) - loss(w-h, b, celsius, fahrenheit)) / (2*h)
    w = w - tasa * dL_dw
    print(f"Paso {paso}: w={w:.4f}, Loss={loss(w, b, celsius, fahrenheit):.2f}")
\`\`\`
> **Observa:** ¿La pérdida baja o explota? ¿Por qué?

### Experimento 2: Learning rate muy pequeño
Repite con \`tasa = 0.0000001\`. ¿La pérdida baja? ¿Qué tan rápido?

### Experimento 3: Derivada en un punto
\`\`\`python
def f(x): return x ** 2  # Parábola
for x in [-3, -1, 0, 1, 3]:
    d = derivada_numerica(f, x)
    print(f"f({x})={f(x)}, f'({x})={d:.2f}")
\`\`\`
> **Predice:** ¿La derivada de x² en x=0 es...? ¿Coincide con la fórmula 2x?

### Experimento 4: Más pasos
Ejecuta el programa con 200 pasos en vez de 30. ¿Cuánto se acerca a w=1.8, b=32?

### Experimento 5: Punto de partida diferente
Comienza con \`w=3.0, b=50.0\` (lejos del óptimo). ¿Llega al mismo resultado?

---

## ⚠️ Errores comunes

**Error 1: Learning rate demasiado alto**
La pérdida explota en vez de bajar. Solución: reducir \`tasa\`.

**Error 2: h demasiado pequeño o grande**
Con \`h=0.0000000001\` hay errores de precisión numérica. Con \`h=1\` la aproximación es mala. Usar \`h=1e-5\` funciona bien.

**Error 3: Olvidar el signo negativo**
\`\`\`python
# ❌ Sube la pérdida (gradient ascent)
w = w + tasa * dL_dw

# ✅ Baja la pérdida (gradient descent)
w = w - tasa * dL_dw
\`\`\`

---

## 🏆 Desafío

Implementa descenso del gradiente para encontrar el mínimo de la función \`f(x) = (x - 3)² + 5\`. Usa derivada numérica. El mínimo debería estar en x=3 con f(x)=5. Comienza desde x=10 y muestra cómo converge paso a paso.

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| Derivada | Pendiente de la función en un punto |
| Gradiente | Vector de derivadas parciales |
| Descenso del gradiente | w = w - lr × ∂L/∂w |
| Learning rate | Tamaño del paso (hiperparámetro crítico) |
| Derivada numérica | (f(x+h) - f(x-h)) / 2h |

---

## 🧠 ¿Qué aprendimos realmente?

El gradiente es la brújula del aprendizaje automático. En vez de probar millones de combinaciones, calculamos la pendiente y caminamos cuesta abajo. Este algoritmo — descenso del gradiente — es el que usa TODO modelo de IA para aprender. Cuando ves que un modelo "se entrena", lo que hace internamente es calcular gradientes y actualizar pesos, miles de veces.

---

## ➡️ ¿Qué aprenderemos después?

Nuestro descenso del gradiente calcula derivadas numéricamente (perturbando cada parámetro). Con millones de parámetros, esto es lento. En la próxima lección uniremos todos los conceptos para construir nuestra primera red neuronal completa desde cero, antes de saltar a los frameworks que hacen todo esto automáticamente.
`
  }
]
