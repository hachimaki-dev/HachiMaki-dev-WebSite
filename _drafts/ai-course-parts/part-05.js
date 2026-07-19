// Part 5: Lessons 9-10
export default [
  {
    title: "Tu Primera Red Neuronal desde Cero",
    excerpt: "Construimos una red neuronal completa con puro NumPy: forward pass, loss, backward pass y entrenamiento. Cero magia, todo transparente.",
    content: `# Lección 9: Tu Primera Red Neuronal desde Cero

## 🎯 Objetivo de aprendizaje

**Una sola idea:** Combinar todos los conceptos anteriores (arrays, producto punto, activación, pérdida, gradiente) para construir una red neuronal completa que **aprende** a convertir Celsius a Fahrenheit.

---

## ¿Por qué existe este concepto?

Hasta ahora hemos aprendido cada pieza por separado. Ahora las ensamblamos. Esto es crucial porque:
- Los frameworks (TensorFlow, PyTorch) ocultan estos detalles
- Si no entiendes qué hace internamente, no puedes depurar
- El 90% de los errores en IA se resuelven entendiendo el flujo interno

---

## Explicación intuitiva

Piensa en una **fábrica** con tres fases:
1. **Forward pass (producción):** Las materias primas (datos) entran, pasan por máquinas (capas), sale un producto (predicción)
2. **Loss (control de calidad):** Se compara el producto con el estándar. Se mide el defecto (error)
3. **Backward pass (retroalimentación):** Se informa a cada máquina qué ajustar para que el próximo producto sea mejor

Este ciclo se repite miles de veces hasta que la fábrica produce productos perfectos.

---

## Explicación técnica

El ciclo de entrenamiento tiene 4 pasos por época:

1. **Forward pass:** \`predicción = activación(X @ W + b)\`
2. **Calcular loss:** \`L = MSE(predicción, real)\`
3. **Backward pass:** Calcular ∂L/∂W y ∂L/∂b (gradientes)
4. **Actualizar:** \`W -= lr × ∂L/∂W\`, \`b -= lr × ∂L/∂b\`

**Backpropagation** es el algoritmo que calcula los gradientes eficientemente usando la regla de la cadena del cálculo diferencial.

---

## 💻 Programa completo

\`\`\`python
# leccion_09_red_desde_cero.py
# Red neuronal completa: de cero a entrenada

import numpy as np

# --- Datos ---
X = np.array([-40, -10, 0, 8, 15, 22, 38], dtype=float).reshape(-1, 1)
Y = np.array([-40, 14, 32, 46, 59, 72, 100], dtype=float).reshape(-1, 1)

# Normalizar (escalar a rango pequeño para estabilidad)
X_norm = X / 100.0
Y_norm = Y / 200.0

# --- Inicializar pesos aleatorios ---
np.random.seed(42)
W1 = np.random.randn(1, 3) * 0.5   # Capa oculta: 1 entrada → 3 neuronas
b1 = np.zeros((1, 3))
W2 = np.random.randn(3, 1) * 0.5   # Capa salida: 3 neuronas → 1 salida
b2 = np.zeros((1, 1))

def relu(z):
    return np.maximum(0, z)

def relu_derivada(z):
    return (z > 0).astype(float)

# --- Entrenamiento ---
lr = 0.01
print("=== ENTRENAMIENTO ===")
for epoca in range(501):
    # 1. FORWARD PASS
    Z1 = X_norm @ W1 + b1       # Pre-activación capa 1
    A1 = relu(Z1)                # Activación capa 1
    Z2 = A1 @ W2 + b2           # Pre-activación capa 2 (salida)
    pred = Z2                    # Sin activación en la salida

    # 2. CALCULAR PÉRDIDA
    error = pred - Y_norm
    loss = np.mean(error ** 2)

    # 3. BACKWARD PASS (backpropagation)
    n = len(X)
    dL_dpred = 2 * error / n          # Derivada de MSE
    dL_dW2 = A1.T @ dL_dpred          # Gradiente de W2
    dL_db2 = np.sum(dL_dpred, axis=0, keepdims=True)
    dL_dA1 = dL_dpred @ W2.T          # Propagar error hacia atrás
    dL_dZ1 = dL_dA1 * relu_derivada(Z1)
    dL_dW1 = X_norm.T @ dL_dZ1       # Gradiente de W1
    dL_db1 = np.sum(dL_dZ1, axis=0, keepdims=True)

    # 4. ACTUALIZAR PESOS
    W2 -= lr * dL_dW2
    b2 -= lr * dL_db2
    W1 -= lr * dL_dW1
    b1 -= lr * dL_db1

    if epoca % 100 == 0:
        print(f"  Época {epoca:4d} | Loss: {loss:.6f}")

# --- Verificar ---
print("\\n=== PREDICCIONES FINALES ===")
pred_final = pred * 200.0
print("Celsius | Real °F | Pred °F")
for i in range(len(X)):
    print(f"  {X[i,0]:5.0f}  |  {Y[i,0]:5.0f}  |  {pred_final[i,0]:6.1f}")

# Predicción nueva
nuevo = np.array([[100.0]]) / 100.0
Z1 = nuevo @ W1 + b1
A1 = relu(Z1)
pred_nuevo = (A1 @ W2 + b2) * 200.0
print(f"\\n🔮 100°C = {pred_nuevo[0,0]:.1f}°F (real: 212°F)")
\`\`\`

---

## 🔍 Explicación línea por línea

- **\`reshape(-1, 1)\`:** Convierte vector 1D en columna 2D. Las redes esperan matrices (filas=muestras, columnas=features).
- **\`X / 100.0\`:** Normalización. Sin ella, los gradientes serían enormes y el entrenamiento inestable.
- **\`np.random.randn(1, 3) * 0.5\`:** Inicialización aleatoria de pesos. Si todos fueran iguales, todas las neuronas aprenderían lo mismo.
- **\`X_norm @ W1\`:** Operador \`@\` = multiplicación de matrices = todas las neuronas a la vez.
- **\`2 * error / n\`:** Derivada de MSE respecto a la predicción.
- **\`A1.T @ dL_dpred\`:** Regla de la cadena para obtener ∂L/∂W2.
- **\`relu_derivada(Z1)\`:** ReLU tiene derivada 1 si z>0, 0 si z≤0.

---

## 📊 Visualización

\`\`\`
FORWARD PASS (→):
  X ──→ [W1, b1] ──→ ReLU ──→ [W2, b2] ──→ predicción
  (7,1)  (1,3)       (7,3)     (3,1)        (7,1)

BACKWARD PASS (←):
  ∂L/∂W1 ←── ∂L/∂Z1 ←── ∂L/∂A1 ←── ∂L/∂W2 ←── ∂L/∂pred ←── Loss
  "¿Cuánto    "Antes      "Después     "¿Cuánto     "Error
   ajustar     de ReLU"    de ReLU"     ajustar      directo"
   W1?"                               W2?"

CICLO DE ENTRENAMIENTO:
  ┌──────────────────────────────────────┐
  │  1. Forward  →  2. Loss  →          │
  │  4. Update  ←  3. Backward  ←       │
  │  ↓ Repetir 500 veces                │
  └──────────────────────────────────────┘
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: Sin normalización
Comenta las líneas de normalización (\`X_norm = X / 100.0\`), usa \`X\` e \`Y\` directamente. ¿Qué pasa con la pérdida?

### Experimento 2: Más neuronas
Cambia de 3 a 10 neuronas: \`W1 = np.random.randn(1, 10)\`. ¿Mejora?

### Experimento 3: Sin ReLU
Reemplaza \`A1 = relu(Z1)\` por \`A1 = Z1\`. ¿Funciona igual?

### Experimento 4: Más épocas
Entrena 2000 épocas. ¿La pérdida sigue bajando o se estanca?

### Experimento 5: Diferentes semillas
Cambia \`np.random.seed(42)\` a \`seed(0)\`, \`seed(99)\`. ¿Llega al mismo resultado?

---

## ⚠️ Errores comunes

**Error 1: Shapes no coinciden**
Si \`X\` es (7,) y \`W1\` es (1,3), la multiplicación falla. Siempre usar \`reshape(-1,1)\`.

**Error 2: Learning rate incorrecto**
Valores > 0.1 suelen explotar. Empezar con 0.01.

**Error 3: No normalizar**
Los datos con rangos grandes generan gradientes enormes.

---

## 🏆 Desafío

Modifica la red para que tenga **2 capas ocultas** (3 neuronas cada una). Entrena y compara la pérdida final con la red de 1 capa oculta. ¿Es mejor?

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| Forward pass | Calcular predicción pasando datos por las capas |
| Loss | MSE entre predicción y realidad |
| Backward pass | Calcular gradientes usando regla de la cadena |
| Actualización | Restar gradiente × learning rate a cada peso |
| Época | Un ciclo completo forward → loss → backward → update |

---

## 🧠 ¿Qué aprendimos realmente?

Construimos una red neuronal COMPLETA desde cero. Cada línea tiene un propósito. No hay magia. El "aprendizaje" es simplemente: predecir → medir error → calcular gradientes → ajustar pesos. Esto es lo que hacen TensorFlow y PyTorch internamente, pero optimizado y con auto-diferenciación.

---

## ➡️ ¿Qué aprenderemos después?

Calcular gradientes a mano es tedioso y propenso a errores. En la próxima lección aprenderemos **TensorFlow y Keras**, que hacen todo esto automáticamente. Veremos que nuestra red de 40 líneas se reduce a 5 líneas de Keras, sin perder nada de lo que aprendimos.
`
  },
  {
    title: "TensorFlow y Keras - Tu Red en 5 Líneas",
    excerpt: "TensorFlow y Keras automatizan todo lo que construimos a mano. Ahora cada línea de framework tiene significado para ti.",
    content: `# Lección 10: TensorFlow y Keras — Tu Red en 5 Líneas

## 🎯 Objetivo de aprendizaje

**Una sola idea:** TensorFlow es un framework que automatiza el forward pass, backward pass y actualización de pesos. Keras es su interfaz de alto nivel que simplifica la construcción de redes.

---

## ¿Por qué existe este concepto?

En la lección anterior escribimos ~40 líneas para una red simple. Los modelos reales tienen millones de parámetros y decenas de capas. Calcular gradientes a mano sería imposible.

TensorFlow resuelve esto con **autodiferenciación**: calcula los gradientes automáticamente. Keras resuelve la usabilidad: describe la red como bloques apilados.

---

## Explicación intuitiva

Si la Lección 9 fue **construir un auto pieza por pieza** (motor, transmisión, frenos), TensorFlow es **comprarlo armado**. Pero como ya construiste uno, sabes qué hay bajo el capó. Si hace un ruido raro, sabes qué pieza revisar.

---

## Explicación técnica

**TensorFlow** opera con **tensores**: arrays multidimensionales (como NumPy pero con soporte GPU y autodiferenciación).

**Keras** organiza la red en:
- **\`Sequential\`**: modelo que apila capas en orden
- **\`Dense\`**: capa completamente conectada (cada neurona recibe todas las entradas)
- **\`compile()\`**: configura optimizador y función de pérdida
- **\`fit()\`**: entrena el modelo (forward + backward + update, automáticamente)

---

## 💻 Programa completo

\`\`\`python
# leccion_10_tensorflow.py
# De 40 líneas manuales a 5 líneas de Keras

import tensorflow as tf
import numpy as np

# Datos (los mismos de siempre)
celsius = np.array([-40, -10, 0, 8, 15, 22, 38], dtype=float)
fahrenheit = np.array([-40, 14, 32, 46, 59, 72, 100], dtype=float)

# ═══════════════════════════════════════════
# MODELO SIMPLE: 1 neurona (regresión lineal)
# ═══════════════════════════════════════════
print("=== MODELO 1: UNA NEURONA ===")
capa = tf.keras.layers.Dense(units=1, input_shape=[1])
modelo = tf.keras.Sequential([capa])

modelo.compile(
    optimizer=tf.keras.optimizers.Adam(0.1),
    loss='mean_squared_error'
)

historial = modelo.fit(celsius, fahrenheit, epochs=500, verbose=False)
print(f"Loss final: {historial.history['loss'][-1]:.4f}")

resultado = modelo.predict([100.0], verbose=0)
print(f"100°C = {resultado[0][0]:.1f}°F (real: 212°F)")

# Ver los pesos aprendidos
print(f"Pesos: {capa.get_weights()[0][0][0]:.4f} (real: 1.8)")
print(f"Sesgo:  {capa.get_weights()[1][0]:.4f} (real: 32.0)")

# ═══════════════════════════════════════════
# MODELO CON CAPAS OCULTAS
# ═══════════════════════════════════════════
print("\\n=== MODELO 2: RED PROFUNDA ===")
oculta1 = tf.keras.layers.Dense(units=3, input_shape=[1])
oculta2 = tf.keras.layers.Dense(units=3)
salida = tf.keras.layers.Dense(units=1)

modelo2 = tf.keras.Sequential([oculta1, oculta2, salida])
modelo2.compile(optimizer=tf.keras.optimizers.Adam(0.1), loss='mean_squared_error')

historial2 = modelo2.fit(celsius, fahrenheit, epochs=500, verbose=False)
print(f"Loss final: {historial2.history['loss'][-1]:.4f}")

resultado2 = modelo2.predict([100.0], verbose=0)
print(f"100°C = {resultado2[0][0]:.1f}°F")

# Comparar pérdidas
print("\\n=== COMPARACIÓN ===")
print(f"1 neurona  → Loss: {historial.history['loss'][-1]:.4f}")
print(f"Red profunda → Loss: {historial2.history['loss'][-1]:.4f}")

# Ver la evolución del entrenamiento
print("\\n=== EVOLUCIÓN DEL LOSS ===")
losses = historial2.history['loss']
for i in [0, 49, 99, 199, 299, 499]:
    barra = "█" * int(max(0, min(50, losses[i] / 100)))
    print(f"  Época {i+1:3d}: {losses[i]:8.1f} {barra}")
\`\`\`

---

## 🔍 Explicación línea por línea

- **\`Dense(units=1, input_shape=[1])\`:** Una capa con 1 neurona. \`input_shape=[1]\` indica que recibe 1 valor. Equivale a: \`salida = entrada × peso + sesgo\`.
- **\`Sequential([capa])\`:** Modelo secuencial: las capas se aplican una tras otra.
- **\`Adam(0.1)\`:** Optimizador Adam con learning rate 0.1. Adam es una versión mejorada del descenso del gradiente que adapta el learning rate automáticamente.
- **\`loss='mean_squared_error'\`:** Usa MSE como función de pérdida (lo que implementamos en la Lección 7).
- **\`fit(celsius, fahrenheit, epochs=500)\`:** Entrena 500 épocas. Internamente hace: forward → loss → backward → update (lo que hicimos en la Lección 9).
- **\`predict([100.0])\`:** Ejecuta solo el forward pass con una entrada nueva.
- **\`get_weights()\`:** Devuelve [pesos, sesgos] de la capa. Nuestro peso debería acercarse a 1.8 y el sesgo a 32.

---

## 📊 Visualización

\`\`\`
LO QUE ESCRIBIMOS (Lección 9):         LO QUE KERAS HACE POR NOSOTROS:
───────────────────────────────         ─────────────────────────────────
W1 = np.random.randn(1,3)*0.5          Dense(3) ← inicialización
Z1 = X @ W1 + b1                       ↓ forward pass automático
A1 = relu(Z1)                          ↓ ReLU automático
Z2 = A1 @ W2 + b2                      Dense(1) ← otra capa
error = pred - Y                        loss='mse' ← pérdida automática
dL_dW2 = A1.T @ dL_dpred               ← backpropagation automático
W2 -= lr * dL_dW2                       Adam ← actualización inteligente

TODO ESTO = modelo.fit(X, Y, epochs=500)

CORRESPONDENCIA:
  Nuestro código          →  Keras
  ──────────────             ─────
  np.dot(x, w) + b       →  Dense(units=...)
  relu(z)                 →  activation='relu'
  MSE(pred, real)         →  loss='mean_squared_error'
  w -= lr * grad          →  optimizer=Adam(lr)
  for epoca in range(N)   →  epochs=N
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: Más neuronas
\`\`\`python
modelo = tf.keras.Sequential([
    tf.keras.layers.Dense(10, input_shape=[1]),
    tf.keras.layers.Dense(10),
    tf.keras.layers.Dense(1)
])
\`\`\`
> Entrena con los mismos datos. ¿Mejora la pérdida? ¿Es más rápido o lento?

### Experimento 2: Diferentes optimizadores
\`\`\`python
modelo.compile(optimizer=tf.keras.optimizers.SGD(0.001), loss='mse')
# vs
modelo.compile(optimizer=tf.keras.optimizers.Adam(0.1), loss='mse')
\`\`\`
> SGD = descenso del gradiente puro (lo que implementamos). ¿Adam converge más rápido?

### Experimento 3: Epochs insuficientes
Entrena solo 10 épocas. ¿Cuál es la predicción para 100°C?

### Experimento 4: model.summary()
\`\`\`python
modelo2.summary()
\`\`\`
> ¿Cuántos parámetros totales tiene? Calcula a mano: capa1 tiene 1×3 pesos + 3 sesgos = 6, etc.

### Experimento 5: Activación explícita
\`\`\`python
modelo = tf.keras.Sequential([
    tf.keras.layers.Dense(3, activation='relu', input_shape=[1]),
    tf.keras.layers.Dense(3, activation='relu'),
    tf.keras.layers.Dense(1)
])
\`\`\`
> Agrega ReLU a las capas ocultas. ¿Cambia el resultado?

---

## ⚠️ Errores comunes

**Error 1: Olvidar input_shape en la primera capa**
\`\`\`python
# ❌ Keras no sabe qué forma tienen los datos
modelo = tf.keras.Sequential([tf.keras.layers.Dense(3)])

# ✅ Especificar en la primera capa
modelo = tf.keras.Sequential([tf.keras.layers.Dense(3, input_shape=[1])])
\`\`\`

**Error 2: No llamar compile antes de fit**
\`\`\`python
# ❌ Error: modelo no compilado
modelo.fit(X, Y, epochs=100)
\`\`\`

**Error 3: Forma incorrecta de los datos**
Keras espera arrays 2D para la entrada: \`(n_muestras, n_features)\`.

---

## 🏆 Desafío

Entrena un modelo Keras para predecir el cuadrado de un número: dado X, predecir X². Genera tus propios datos de entrenamiento (ej: X = 1..20, Y = 1..400). ¿Cuántas neuronas y capas necesitas?

---

## 📋 Resumen

| Concepto Keras | Equivalente manual |
|----------------|-------------------|
| \`Dense(n)\` | Pesos W(in, n) + sesgo b(n) |
| \`Sequential\` | Apilar capas en orden |
| \`compile()\` | Elegir optimizador y loss |
| \`fit()\` | Bucle de entrenamiento completo |
| \`predict()\` | Solo forward pass |
| \`Adam\` | Descenso del gradiente mejorado |

---

## 🧠 ¿Qué aprendimos realmente?

Keras no hace magia: automatiza exactamente lo que construimos a mano. La diferencia es que Keras calcula gradientes analíticamente (autodiferenciación, no derivadas numéricas), puede usar GPU, y tiene optimizadores sofisticados como Adam. Pero la lógica es la misma: forward → loss → backward → update.

---

## ➡️ ¿Qué aprenderemos después?

Hasta ahora hemos trabajado con datos simples (7 números). Los modelos reales necesitan datasets mucho más grandes y variados. En la próxima lección aprenderemos sobre **datasets y preprocesamiento**: cómo cargar, limpiar, dividir y normalizar datos para que la red pueda aprender de ellos eficientemente.
`
  }
]
