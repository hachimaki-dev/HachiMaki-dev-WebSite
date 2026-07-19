// Part 8: Lesson 15 (Final)
export default [
  {
    title: "Proyecto Final - Clasificador de Imágenes Completo",
    excerpt: "Todo lo aprendido en un solo proyecto: datos, preprocesamiento, arquitectura CNN, entrenamiento, evaluación y predicción. Tu primer modelo real.",
    content: `# Lección 15: Proyecto Final — Clasificador de Imágenes Completo

## 🎯 Objetivo de aprendizaje

**Una sola idea:** Integrar TODOS los conceptos aprendidos (Python, NumPy, funciones, activaciones, pérdida, gradientes, Keras, preprocesamiento, regularización, clasificación, CNN) en un proyecto completo y funcional.

---

## ¿Por qué existe esta lección?

Has aprendido cada pieza individualmente. Ahora es momento de demostrar que puedes ensamblarlas todas. Un ingeniero de IA no solo sabe qué es una CNN — sabe cuándo usarla, cómo preprocesar los datos, cómo diagnosticar problemas y cómo mejorar el modelo.

---

## Explicación intuitiva

Hasta ahora fuiste un mecánico aprendiendo pieza por pieza: motor (neuronas), transmisión (capas), frenos (regularización), combustible (datos), velocímetro (métricas). Ahora vas a **construir y conducir el auto completo**.

---

## Explicación técnica

El pipeline completo de un proyecto de clasificación de imágenes:

1. **Cargar y explorar** el dataset
2. **Preprocesar:** normalizar, reshape, dividir
3. **Diseñar** la arquitectura (CNN)
4. **Compilar:** elegir loss, optimizer, métricas
5. **Entrenar:** con validación y early stopping
6. **Evaluar:** accuracy, matriz de confusión, ejemplos
7. **Iterar:** mejorar el modelo basándose en los resultados

---

## 💻 Programa completo

\`\`\`python
# leccion_15_proyecto_final.py
# Proyecto Final: Clasificador CIFAR-10 (10 categorías de objetos reales)

import numpy as np
import tensorflow as tf

# ═══════════════════════════════════════════════════
# PASO 1: CARGAR Y EXPLORAR
# ═══════════════════════════════════════════════════
print("=" * 50)
print("PASO 1: CARGAR DATASET")
print("=" * 50)
(X_train, Y_train), (X_test, Y_test) = tf.keras.datasets.cifar10.load_data()

clases = ['avión', 'auto', 'pájaro', 'gato', 'ciervo',
          'perro', 'rana', 'caballo', 'barco', 'camión']

print(f"Entrenamiento: {X_train.shape}")  # (50000, 32, 32, 3) RGB
print(f"Prueba:        {X_test.shape}")    # (10000, 32, 32, 3)
print(f"Clases: {clases}")

# Distribución de clases
for i in range(10):
    count = np.sum(Y_train == i)
    barra = "█" * (count // 200)
    print(f"  {clases[i]:10s}: {count} {barra}")

# ═══════════════════════════════════════════════════
# PASO 2: PREPROCESAMIENTO
# ═══════════════════════════════════════════════════
print(f"\\n{'=' * 50}")
print("PASO 2: PREPROCESAMIENTO")
print("=" * 50)

X_train = X_train.astype('float32') / 255.0
X_test = X_test.astype('float32') / 255.0

# Validación: separar 10% del training
X_val = X_train[-5000:]
Y_val = Y_train[-5000:]
X_train = X_train[:-5000]
Y_train = Y_train[:-5000]

print(f"Training:   {X_train.shape[0]} imágenes")
print(f"Validación: {X_val.shape[0]} imágenes")
print(f"Test:       {X_test.shape[0]} imágenes")
print(f"Rango de píxeles: [{X_train.min()}, {X_train.max()}]")

# ═══════════════════════════════════════════════════
# PASO 3: ARQUITECTURA CNN
# ═══════════════════════════════════════════════════
print(f"\\n{'=' * 50}")
print("PASO 3: DISEÑO DE LA RED")
print("=" * 50)

modelo = tf.keras.Sequential([
    # Bloque 1: detectar bordes y texturas
    tf.keras.layers.Conv2D(32, (3,3), activation='relu',
                           padding='same', input_shape=(32,32,3)),
    tf.keras.layers.Conv2D(32, (3,3), activation='relu', padding='same'),
    tf.keras.layers.MaxPooling2D((2,2)),
    tf.keras.layers.Dropout(0.25),

    # Bloque 2: detectar formas y patrones
    tf.keras.layers.Conv2D(64, (3,3), activation='relu', padding='same'),
    tf.keras.layers.Conv2D(64, (3,3), activation='relu', padding='same'),
    tf.keras.layers.MaxPooling2D((2,2)),
    tf.keras.layers.Dropout(0.25),

    # Clasificador
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(10, activation='softmax')
])

modelo.summary()

# ═══════════════════════════════════════════════════
# PASO 4: COMPILAR
# ═══════════════════════════════════════════════════
modelo.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# ═══════════════════════════════════════════════════
# PASO 5: ENTRENAR
# ═══════════════════════════════════════════════════
print(f"\\n{'=' * 50}")
print("PASO 5: ENTRENAMIENTO")
print("=" * 50)

callbacks = [
    tf.keras.callbacks.EarlyStopping(
        patience=5,
        restore_best_weights=True,
        monitor='val_accuracy'
    ),
    tf.keras.callbacks.ReduceLROnPlateau(
        factor=0.5,
        patience=3,
        monitor='val_loss'
    )
]

hist = modelo.fit(
    X_train, Y_train,
    epochs=30,
    batch_size=64,
    validation_data=(X_val, Y_val),
    callbacks=callbacks,
    verbose=1
)

# ═══════════════════════════════════════════════════
# PASO 6: EVALUAR
# ═══════════════════════════════════════════════════
print(f"\\n{'=' * 50}")
print("PASO 6: EVALUACIÓN")
print("=" * 50)

test_loss, test_acc = modelo.evaluate(X_test, Y_test, verbose=0)
print(f"\\nAccuracy en test: {test_acc:.1%}")

# Accuracy por clase
pred_all = modelo.predict(X_test, verbose=0)
pred_clases = np.argmax(pred_all, axis=1)

print("\\nAccuracy por clase:")
for i in range(10):
    mask = Y_test.flatten() == i
    acc = np.mean(pred_clases[mask] == i)
    barra = "█" * int(acc * 20)
    print(f"  {clases[i]:10s}: {acc:.1%} {barra}")

# Predicciones ejemplo
print("\\nEjemplos de predicciones:")
for i in range(8):
    real = clases[Y_test[i][0]]
    pred = clases[pred_clases[i]]
    conf = pred_all[i][pred_clases[i]]
    icon = "✅" if real == pred else "❌"
    print(f"  {icon} Real: {real:10s} | Pred: {pred:10s} ({conf:.1%})")

# Evolución del entrenamiento
print("\\nEvolución del entrenamiento:")
print("Época | Train Acc | Val Acc | Estado")
print("-" * 50)
epochs = len(hist.history['accuracy'])
for i in [0, epochs//4, epochs//2, 3*epochs//4, epochs-1]:
    ta = hist.history['accuracy'][i]
    va = hist.history['val_accuracy'][i]
    gap = ta - va
    estado = "⚠️ overfitting" if gap > 0.1 else "✅ ok"
    print(f"  {i+1:3d}   | {ta:7.1%}   | {va:7.1%} | {estado}")

print(f"\\n🏁 Entrenamiento completado en {epochs} épocas")
print(f"   Mejor accuracy: {max(hist.history['val_accuracy']):.1%}")
\`\`\`

---

## 🔍 Explicación línea por línea

- **CIFAR-10:** Dataset de 60,000 imágenes 32×32 RGB en 10 categorías. Más difícil que MNIST.
- **\`padding='same'\`:** Mantiene la misma dimensión después de la convolución (agrega ceros alrededor).
- **Dos Conv2D seguidas:** Detectar patrones más complejos antes de reducir resolución con MaxPooling.
- **\`Dropout(0.25)\` en conv, \`0.5\` en dense:** Más dropout en las capas densas porque tienen más parámetros.
- **\`ReduceLROnPlateau\`:** Reduce el learning rate a la mitad cuando la pérdida se estanca. Permite empezar con pasos grandes y terminar con pasos finos.
- **\`monitor='val_accuracy'\`:** EarlyStopping vigila el accuracy de validación, no el de entrenamiento.

---

## 📊 Visualización

\`\`\`
PIPELINE COMPLETO:
  ┌──────────┐   ┌──────────────┐   ┌───────────┐
  │  CARGAR  │──►│ PREPROCESAR  │──►│  DISEÑAR  │
  │  datos   │   │ normalizar   │   │  CNN      │
  └──────────┘   │ dividir      │   └─────┬─────┘
                 └──────────────┘         │
  ┌──────────┐   ┌──────────────┐   ┌─────▼─────┐
  │ EVALUAR  │◄──│  ENTRENAR    │◄──│ COMPILAR  │
  │ accuracy │   │ 30 épocas    │   │ Adam+BCE  │
  │ confusión│   │ early stop   │   └───────────┘
  └──────────┘   └──────────────┘

ARQUITECTURA:
  Input(32×32×3)
    │
    ├─ Conv2D(32) + Conv2D(32) + Pool + Drop ──► 16×16×32
    │
    ├─ Conv2D(64) + Conv2D(64) + Pool + Drop ──► 8×8×64
    │
    ├─ Flatten (4096)
    │
    ├─ Dense(128) + Drop
    │
    └─ Dense(10) + Softmax ──► [avión, auto, ..., camión]
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: Sin Dropout
Elimina todas las capas Dropout y entrena. ¿El gap entre train y val accuracy crece?

### Experimento 2: Menos capas
Usa solo 1 Conv2D + 1 MaxPooling. ¿Cuánto accuracy pierdes?

### Experimento 3: Data Augmentation
\`\`\`python
data_aug = tf.keras.Sequential([
    tf.keras.layers.RandomFlip("horizontal"),
    tf.keras.layers.RandomRotation(0.1),
])
# Agregar como primera capa del modelo
\`\`\`
> ¿Mejora el accuracy en test?

### Experimento 4: Modelo pre-entrenado (Transfer Learning)
\`\`\`python
base = tf.keras.applications.MobileNetV2(input_shape=(32,32,3),
                                          include_top=False,
                                          weights='imagenet')
base.trainable = False
\`\`\`
> Un modelo entrenado en millones de imágenes, adaptado a tu problema.

### Experimento 5: Confusión entre clases
¿Qué clases confunde más? (pista: gato vs perro, auto vs camión)

---

## ⚠️ Errores comunes

**Error 1: No separar validación del test**
Validación es para ajustar hiperparámetros. Test es para la evaluación FINAL.

**Error 2: Entrenar demasiadas épocas sin early stopping**
El modelo memoriza el training set.

**Error 3: Learning rate fijo**
Empezar alto y reducir gradualmente (ReduceLROnPlateau) da mejores resultados.

---

## 🏆 Desafío Final

Mejora el modelo para superar **75% de accuracy** en CIFAR-10. Técnicas a probar:
1. Más filtros (128, 256)
2. Batch Normalization
3. Data Augmentation
4. Learning rate scheduling
5. Más capas convolucionales

Documenta cada cambio y su efecto en el accuracy.

---

## 📋 Resumen del Curso Completo

| Lección | Concepto | Pieza del rompecabezas |
|---------|----------|----------------------|
| 1 | Python | El idioma para hablar con la máquina |
| 2 | Variables | Memoria para datos y pesos |
| 3 | Listas | Colecciones de datos |
| 4 | NumPy | Matemáticas vectorizadas |
| 5 | Funciones | Código reutilizable y modular |
| 6 | Activaciones | No linealidad (ReLU, Sigmoid) |
| 7 | Función de pérdida | Medir el error (MSE, BCE) |
| 8 | Gradiente | Dirección para reducir el error |
| 9 | Red desde cero | Forward + Backward + Update |
| 10 | TensorFlow/Keras | Automatizar todo lo anterior |
| 11 | Datasets | Cargar, limpiar, normalizar, dividir |
| 12 | Overfitting | Memorización vs generalización |
| 13 | Clasificación binaria | Sí/No con Sigmoid + BCE |
| 14 | CNN + Multiclase | Imágenes con Conv2D + Softmax |
| 15 | Proyecto final | Todo integrado |

---

## 🧠 ¿Qué aprendimos realmente?

Has recorrido el camino completo: desde \`print(5 + 3)\` hasta clasificar imágenes con redes convolucionales. Cada concepto construyó sobre el anterior:
- **Python** te dio el idioma
- **NumPy** te dio la velocidad
- **Funciones y activaciones** te dieron las piezas de la red
- **Pérdida y gradientes** te dieron el mecanismo de aprendizaje
- **Keras** te dio la herramienta profesional
- **Preprocesamiento y regularización** te dieron la madurez ingenieril
- **CNN** te dio la arquitectura para problemas reales

**Ya no eres alguien que copia código de tutoriales.** Eres alguien que entiende QUÉ hace cada línea y POR QUÉ existe.

---

## ➡️ ¿Qué sigue después del curso?

Este curso cubrió los **fundamentos sólidos**. Para seguir creciendo:

1. **Redes Recurrentes (RNN/LSTM):** Para datos secuenciales (texto, series temporales)
2. **Transformers y Atención:** La arquitectura detrás de ChatGPT
3. **GANs:** Redes que generan imágenes realistas
4. **Reinforcement Learning:** Agentes que aprenden jugando
5. **PyTorch:** El framework preferido en investigación
6. **Papers:** Leer artículos científicos originales
7. **Kaggle:** Competencias reales con datos reales

Ahora tienes la base para entender todo esto. Las piezas son las mismas: datos → modelo → pérdida → gradiente → entrenamiento. Lo que cambia es la arquitectura y el tipo de datos.

**¡Felicidades por completar el curso! 🎓**
`
  }
]
