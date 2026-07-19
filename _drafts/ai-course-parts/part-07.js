// Part 7: Lessons 13-14
export default [
  {
    title: "Clasificación Binaria - Sí o No",
    excerpt: "Pasar de predecir números a predecir categorías. La clasificación binaria responde preguntas de sí/no con probabilidades.",
    content: `# Lección 13: Clasificación Binaria — Sí o No

## 🎯 Objetivo de aprendizaje

**Una sola idea:** La clasificación binaria predice una de dos clases (sí/no, spam/no-spam, gato/perro) usando sigmoid en la salida y **entropía cruzada binaria** como función de pérdida.

---

## ¿Por qué existe este concepto?

Hasta ahora predijimos números continuos (regresión): temperatura, precio. Pero muchos problemas reales son decisiones binarias:
- ¿Este email es spam?
- ¿Este tumor es maligno?
- ¿Este cliente comprará?

No queremos un número como 47.3. Queremos una **probabilidad**: "83% de probabilidad de que sea spam".

---

## Explicación intuitiva

Imagina un **detector de metales** en un aeropuerto:
- **Regresión:** "Hay 2.7 kg de metal" (número continuo)
- **Clasificación:** "ALERTA: 95% probabilidad de objeto peligroso" (decisión binaria con confianza)

La clave es la capa final: en vez de dar cualquier número, sigmoid la comprime a un valor entre 0 y 1 que interpretamos como probabilidad.

---

## Explicación técnica

**Cambios respecto a regresión:**

| Aspecto | Regresión | Clasificación binaria |
|---------|-----------|----------------------|
| Activación final | Ninguna (lineal) | Sigmoid |
| Función de pérdida | MSE | Binary Cross-Entropy |
| Salida | Cualquier número | Probabilidad (0-1) |
| Decisión | El número ES la predicción | Si prob > 0.5 → clase 1, sino → clase 0 |

**Binary Cross-Entropy:**
\`\`\`
BCE = -[y × log(p) + (1-y) × log(1-p)]
\`\`\`
Penaliza fuertemente las predicciones confiantes que están equivocadas.

---

## 💻 Programa completo

\`\`\`python
# leccion_13_clasificacion_binaria.py
# Clasificación: ¿aprueba o reprueba?

import numpy as np
import tensorflow as tf

# Dataset: horas de estudio → ¿aprueba? (1=sí, 0=no)
np.random.seed(42)
horas = np.concatenate([
    np.random.normal(3, 1.5, 50),   # Reprobados: pocas horas
    np.random.normal(8, 1.5, 50)    # Aprobados: muchas horas
])
aprueba = np.array([0]*50 + [1]*50, dtype=float)

# Mezclar y normalizar
indices = np.random.permutation(100)
X = horas[indices].reshape(-1, 1) / 12.0  # Normalizar
Y = aprueba[indices].reshape(-1, 1)

# Dividir
X_train, X_test = X[:80], X[80:]
Y_train, Y_test = Y[:80], Y[80:]

# Modelo de clasificación binaria
modelo = tf.keras.Sequential([
    tf.keras.layers.Dense(8, activation='relu', input_shape=[1]),
    tf.keras.layers.Dense(4, activation='relu'),
    tf.keras.layers.Dense(1, activation='sigmoid')  # ← clave
])

modelo.compile(
    optimizer='adam',
    loss='binary_crossentropy',    # ← clave
    metrics=['accuracy']           # % de aciertos
)

hist = modelo.fit(X_train, Y_train, epochs=100,
                  validation_data=(X_test, Y_test), verbose=0)

# Resultados
print("=== RESULTADOS ===")
print(f"Accuracy entrenamiento: {hist.history['accuracy'][-1]:.1%}")
print(f"Accuracy prueba:        {hist.history['val_accuracy'][-1]:.1%}")

# Predicciones individuales
print("\\n=== PREDICCIONES ===")
horas_prueba = np.array([1, 3, 5, 7, 10]).reshape(-1, 1) / 12.0
probs = modelo.predict(horas_prueba, verbose=0)
for i, h in enumerate([1, 3, 5, 7, 10]):
    p = probs[i][0]
    decision = "APRUEBA ✅" if p > 0.5 else "REPRUEBA ❌"
    print(f"  {h}h estudio → {p:.1%} prob → {decision}")

# Matriz de confusión manual
print("\\n=== MATRIZ DE CONFUSIÓN ===")
pred_test = (modelo.predict(X_test, verbose=0) > 0.5).astype(int)
tp = np.sum((pred_test == 1) & (Y_test == 1))
tn = np.sum((pred_test == 0) & (Y_test == 0))
fp = np.sum((pred_test == 1) & (Y_test == 0))
fn = np.sum((pred_test == 0) & (Y_test == 1))
print(f"  Verdaderos Positivos: {tp}")
print(f"  Verdaderos Negativos: {tn}")
print(f"  Falsos Positivos:     {fp}")
print(f"  Falsos Negativos:     {fn}")
print(f"  Precisión: {tp/(tp+fp+1e-8):.1%}")
print(f"  Recall:    {tp/(tp+fn+1e-8):.1%}")
\`\`\`

---

## 🔍 Explicación línea por línea

- **\`activation='sigmoid'\`:** Última capa con sigmoid comprime la salida a (0, 1) = probabilidad.
- **\`loss='binary_crossentropy'\`:** BCE penaliza mucho las predicciones confiantes erróneas (predecir 0.99 cuando es 0).
- **\`metrics=['accuracy']\`:** Keras calcula el porcentaje de aciertos automáticamente.
- **\`> 0.5\`:** Umbral de decisión. Probabilidad > 50% = clase positiva.
- **Matriz de confusión:** TP = predijiste 1 y era 1. FP = predijiste 1 pero era 0. Etc.
- **Precisión:** De los que dijiste "sí", ¿cuántos realmente eran sí?
- **Recall:** De los que realmente eran sí, ¿cuántos detectaste?

---

## 📊 Visualización

\`\`\`
SIGMOID COMO DECISIÓN:
  Probabilidad
  1.0 │                    ╱───── APRUEBA (>0.5)
      │                  ╱
  0.5 │─ ─ ─ ─ ─ ─ ─ ╱ ─ ─ ─ ← umbral de decisión
      │              ╱
  0.0 │────────────╱───────── REPRUEBA (<0.5)
      └────────────────────── Horas de estudio
      0    2    4    6    8   10

MATRIZ DE CONFUSIÓN:
                 Predicción
                  0    1
  Real    0    [ TN | FP ]
          1    [ FN | TP ]
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: Cambiar el umbral
\`\`\`python
for umbral in [0.3, 0.5, 0.7, 0.9]:
    pred = (modelo.predict(X_test, verbose=0) > umbral).astype(int)
    acc = np.mean(pred == Y_test)
    print(f"Umbral {umbral} → Accuracy: {acc:.1%}")
\`\`\`
> ¿Un umbral más alto es siempre mejor?

### Experimento 2: MSE vs BCE
Compila con \`loss='mse'\` en vez de BCE. ¿El accuracy cambia?

### Experimento 3: Datos desbalanceados
Usa 90 reprobados y 10 aprobados. ¿Qué accuracy obtiene? ¿Es engañoso?

### Experimento 4: Dos features
Agrega "horas de sueño" como segunda feature. ¿Mejora?

### Experimento 5: La frontera de decisión
\`\`\`python
for h in np.arange(0, 12, 0.5):
    p = modelo.predict(np.array([[h/12.0]]), verbose=0)[0][0]
    bar = "█" * int(p * 30)
    print(f"  {h:4.1f}h → {p:.2f} {bar}")
\`\`\`
> ¿En cuántas horas está la "frontera" (~0.5)?

---

## ⚠️ Errores comunes

**Error 1: Usar MSE para clasificación**
MSE funciona pero converge más lento y menos estable que BCE.

**Error 2: Olvidar sigmoid en la última capa**
Sin sigmoid, la salida puede ser -5 o 23. No es una probabilidad.

**Error 3: Accuracy engañoso con datos desbalanceados**
Con 95% de clase 0, un modelo que SIEMPRE predice 0 tiene 95% accuracy pero es inútil.

---

## 🏆 Desafío

Crea un clasificador de "spam" con datos sintéticos. Features: largo del mensaje, cantidad de signos de exclamación, cantidad de links. Genera datos donde los spams tengan más de cada feature. Entrena, evalúa y muestra la matriz de confusión.

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| Clasificación binaria | Predecir 0 o 1 |
| Sigmoid | Comprime la salida a probabilidad |
| Binary Cross-Entropy | Loss para clasificación binaria |
| Accuracy | % de predicciones correctas |
| Matriz de confusión | TP, TN, FP, FN |
| Precisión/Recall | Métricas más informativas que accuracy |

---

## 🧠 ¿Qué aprendimos realmente?

La clasificación binaria es regresión con dos extras: sigmoid para convertir la salida en probabilidad, y BCE como pérdida. La matriz de confusión nos da una imagen mucho más completa que el simple accuracy. En problemas médicos, un falso negativo (no detectar una enfermedad) es mucho peor que un falso positivo.

---

## ➡️ ¿Qué aprenderemos después?

Con dos clases funciona bien, pero ¿y si queremos clasificar en 10 categorías? (ej: dígitos 0-9). En la próxima lección aprenderemos **clasificación multiclase** con softmax y las redes neuronales convolucionales (CNN) para reconocimiento de imágenes.
`
  },
  {
    title: "Clasificación Multiclase y Redes Convolucionales",
    excerpt: "De dos clases a muchas. Clasificar imágenes de dígitos con CNNs: la arquitectura que revolucionó la visión por computadora.",
    content: `# Lección 14: Clasificación Multiclase y Redes Convolucionales

## 🎯 Objetivo de aprendizaje

**Una sola idea:** La clasificación multiclase predice entre N clases usando **softmax** en la salida, y las **redes convolucionales (CNN)** son la arquitectura diseñada para procesar imágenes.

---

## ¿Por qué existe este concepto?

Sigmoid funciona para 2 clases. Pero si queremos reconocer dígitos (0-9), necesitamos 10 clases. Y si las entradas son imágenes (28×28 píxeles), una red densa tendría 784 entradas, todas conectadas a cada neurona — muy ineficiente.

Las **CNNs** resuelven esto: procesan la imagen por partes (filtros), detectando bordes, formas y patrones de forma jerárquica.

---

## Explicación intuitiva

**Softmax:** Imagina un concurso de talentos con 10 jueces. Cada juez da un puntaje. Softmax convierte esos puntajes en probabilidades que suman 100%:
- Juez 0: 2 pts → 5%
- Juez 7: 8 pts → 60%
- Juez 3: 4 pts → 15%

**CNN:** Imagina que buscas a Waldo en un libro enorme. No miras toda la página de golpe — escaneas por zonas, buscando rayas rojas, gafas, gorro. Las capas convolucionales hacen exactamente eso: escanean la imagen con filtros que detectan patrones locales.

---

## Explicación técnica

**Softmax:** Convierte N valores en N probabilidades que suman 1:
\`\`\`
softmax(zᵢ) = e^(zᵢ) / Σe^(zⱼ)
\`\`\`

**Capa Conv2D:** Aplica un filtro pequeño (ej: 3×3) que se desliza por toda la imagen, produciendo un **mapa de features** que resalta patrones específicos.

**MaxPooling:** Reduce la resolución tomando el valor máximo en cada región, haciendo el modelo más compacto e invariante a la posición.

---

## 💻 Programa completo

\`\`\`python
# leccion_14_cnn.py
# CNN: reconocimiento de dígitos escritos a mano (MNIST)

import tensorflow as tf
import numpy as np

# Cargar MNIST (70,000 imágenes de dígitos 28×28)
(X_train, Y_train), (X_test, Y_test) = tf.keras.datasets.mnist.load_data()

print("=== DATASET MNIST ===")
print(f"Entrenamiento: {X_train.shape}")  # (60000, 28, 28)
print(f"Prueba: {X_test.shape}")           # (10000, 28, 28)
print(f"Clases: {np.unique(Y_train)}")     # [0, 1, 2, ..., 9]

# Preprocesamiento
X_train = X_train.reshape(-1, 28, 28, 1).astype('float32') / 255.0
X_test = X_test.reshape(-1, 28, 28, 1).astype('float32') / 255.0

# Visualizar un ejemplo (ASCII art)
print("\\nEjemplo (dígito", Y_train[0], "):")
img = X_train[0, :, :, 0]
for fila in range(0, 28, 2):
    linea = ""
    for col in range(0, 28, 2):
        v = img[fila, col]
        linea += "██" if v > 0.5 else "░░" if v > 0.1 else "  "
    print(f"  {linea}")

# Construir CNN
modelo = tf.keras.Sequential([
    tf.keras.layers.Conv2D(16, (3,3), activation='relu', input_shape=(28,28,1)),
    tf.keras.layers.MaxPooling2D((2,2)),
    tf.keras.layers.Conv2D(32, (3,3), activation='relu'),
    tf.keras.layers.MaxPooling2D((2,2)),
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(10, activation='softmax')  # 10 clases
])

modelo.compile(optimizer='adam',
               loss='sparse_categorical_crossentropy',
               metrics=['accuracy'])

modelo.summary()

# Entrenar
hist = modelo.fit(X_train, Y_train, epochs=5, batch_size=64,
                  validation_data=(X_test, Y_test), verbose=1)

# Resultados
print(f"\\nAccuracy final: {hist.history['val_accuracy'][-1]:.1%}")

# Predicciones
pred = modelo.predict(X_test[:5], verbose=0)
print("\\n=== PREDICCIONES ===")
for i in range(5):
    probs = pred[i]
    clase = np.argmax(probs)
    conf = probs[clase]
    print(f"  Real: {Y_test[i]} | Pred: {clase} ({conf:.1%})")
\`\`\`

---

## 🔍 Explicación línea por línea

- **\`reshape(-1, 28, 28, 1)\`:** CNN espera 4D: (muestras, alto, ancho, canales). 1 canal = escala de grises.
- **\`/ 255.0\`:** Normalizar píxeles de 0-255 a 0-1.
- **\`Conv2D(16, (3,3))\`:** 16 filtros de 3×3. Cada filtro detecta un patrón diferente (bordes horizontales, verticales, curvas...).
- **\`MaxPooling2D((2,2))\`:** Reduce de 26×26 a 13×13 tomando el máximo en cada cuadro 2×2.
- **\`Flatten()\`:** Convierte la imagen 2D en un vector 1D para las capas Dense.
- **\`Dense(10, activation='softmax')\`:** 10 neuronas de salida (una por dígito). Softmax las convierte en probabilidades.
- **\`sparse_categorical_crossentropy\`:** Como BCE pero para múltiples clases. "Sparse" porque las etiquetas son enteros (5), no one-hot ([0,0,0,0,0,1,0,0,0,0]).
- **\`np.argmax(probs)\`:** Índice del valor máximo = clase predicha.

---

## 📊 Visualización

\`\`\`
ARQUITECTURA CNN:
  Imagen   →  Conv2D  →  Pool  →  Conv2D  →  Pool  →  Flat  →  Dense  →  Softmax
  28×28×1     26×26×16   13×13×16  11×11×32   5×5×32    800      64       10

FILTRO CONVOLUCIONAL (3×3):
  ┌───────────────────┐     ┌─────┐
  │ Imagen original   │     │-1 0 1│  ← filtro detector
  │                   │ ──► │-1 0 1│     de bordes verticales
  │  se escanea con   │     │-1 0 1│
  │  el filtro        │     └─────┘
  └───────────────────┘

SOFTMAX:
  Salida cruda: [1.2, 0.5, 3.1, 0.1, ..., 8.7]
  Softmax:      [2%, 1%, 5%, 0.1%, ..., 87%]  ← suma = 100%
  Predicción:   dígito 9 (87% de confianza)
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: Sin capas convolucionales
\`\`\`python
modelo_denso = tf.keras.Sequential([
    tf.keras.layers.Flatten(input_shape=(28,28,1)),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dense(10, activation='softmax')
])
\`\`\`
> Compara accuracy con CNN. ¿Cuántos parámetros tiene cada uno?

### Experimento 2: Más filtros
Usa \`Conv2D(64, ...)\` y \`Conv2D(128, ...)\`. ¿Mejora mucho?

### Experimento 3: Más épocas
Entrena 20 épocas. ¿Sigue mejorando o hace overfitting?

### Experimento 4: Predicción incorrecta
\`\`\`python
pred_all = modelo.predict(X_test, verbose=0)
for i in range(100):
    c = np.argmax(pred_all[i])
    if c != Y_test[i]:
        print(f"Indice {i}: Real={Y_test[i]}, Pred={c} ({pred_all[i][c]:.1%})")
        break
\`\`\`
> ¿El modelo tiene baja confianza en sus errores?

### Experimento 5: Fashion MNIST
\`\`\`python
(fX_train, fY_train), (fX_test, fY_test) = tf.keras.datasets.fashion_mnist.load_data()
\`\`\`
> Mismo modelo, diferentes datos (ropa en vez de dígitos). ¿Funciona?

---

## ⚠️ Errores comunes

**Error 1: Olvidar el reshape a 4D**
Conv2D necesita (muestras, alto, ancho, canales). Sin el reshape, falla.

**Error 2: Confundir categorical vs sparse_categorical**
\`sparse\`: etiquetas como enteros (3, 7, 0). Sin sparse: etiquetas one-hot ([0,0,0,1,...]).

**Error 3: No usar Flatten antes de Dense**
Dense necesita un vector 1D, no una imagen 2D.

---

## 🏆 Desafío

Entrena una CNN en Fashion MNIST (ropa: camisetas, pantalones, zapatos...). Logra al menos 88% de accuracy. Muestra ejemplos de predicciones correctas e incorrectas.

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| Softmax | N probabilidades que suman 1 |
| Conv2D | Filtro que detecta patrones locales |
| MaxPooling | Reduce resolución, extrae lo importante |
| Flatten | 2D → 1D para capas Dense |
| Categorical CE | Loss para N clases |
| CNN | Conv → Pool → Conv → Pool → Dense → Softmax |

---

## 🧠 ¿Qué aprendimos realmente?

Las CNNs son la razón por la cual tu teléfono reconoce caras, los autos autónomos ven semáforos y los médicos detectan tumores en radiografías. La idea es elegante: en vez de mirar todos los píxeles de golpe, escanear con filtros pequeños que detectan patrones locales, y ir combinando esos patrones en conceptos cada vez más abstractos (bordes → formas → objetos).

---

## ➡️ ¿Qué aprenderemos después?

Hemos cubierto los fundamentos completos: desde Python hasta CNNs. En la próxima lección (la última), recapitularemos todo el camino recorrido y construiremos un proyecto completo de principio a fin, integrando todos los conceptos aprendidos en un modelo real.
`
  }
]
