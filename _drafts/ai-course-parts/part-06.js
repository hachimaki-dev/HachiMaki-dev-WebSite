// Part 6: Lessons 11-12
export default [
  {
    title: "Datasets y Preprocesamiento - Alimentando la Red",
    excerpt: "Los datos son el combustible de la IA. Aprende a cargarlos, limpiarlos, dividirlos y normalizarlos para que tu modelo pueda aprender.",
    content: `# Lección 11: Datasets y Preprocesamiento — Alimentando la Red

## 🎯 Objetivo de aprendizaje

**Una sola idea:** Los modelos de IA solo son tan buenos como los datos que reciben. **Preprocesar** los datos (limpiar, normalizar, dividir) es tan importante como diseñar la red.

---

## ¿Por qué existe este concepto?

Hasta ahora usamos 7 datos de temperatura. Los modelos reales necesitan miles o millones. Además, los datos del mundo real son sucios: tienen valores faltantes, escalas diferentes, y outliers.

Si alimentas basura a una red, produce basura. El preprocesamiento transforma datos crudos en datos que la red puede digerir.

---

## Explicación intuitiva

Imagina que cocinas para un robot:
- **Datos crudos:** Una vaca entera, trigo sin moler, tomates con tierra
- **Preprocesamiento:** Cortar la carne, hacer harina, lavar los tomates
- **Datos listos:** Ingredientes limpios, cortados, medidos y listos para cocinar

El robot (la red) no puede cocinar con ingredientes crudos. Necesita datos preparados.

---

## Explicación técnica

Los pasos fundamentales del preprocesamiento:

1. **Cargar:** Leer datos desde archivos (CSV, JSON, etc.)
2. **Explorar:** Entender la estructura, rangos y distribución
3. **Limpiar:** Eliminar o rellenar valores faltantes
4. **Normalizar:** Escalar valores al mismo rango (ej: 0-1)
5. **Dividir:** Separar en conjunto de entrenamiento (80%) y prueba (20%)

**¿Por qué dividir?** Si evalúas el modelo con los mismos datos que usaste para entrenar, no sabes si realmente aprendió o solo memorizó. El conjunto de prueba simula datos nuevos que nunca ha visto.

---

## 💻 Programa completo

\`\`\`python
# leccion_11_datasets.py
# Preprocesamiento: el paso que nadie ve pero todos necesitan

import numpy as np
import tensorflow as tf

# 1. CARGAR DATOS (simulamos un dataset de casas)
np.random.seed(42)
n = 200
metros = np.random.uniform(30, 250, n)           # 30-250 m²
habitaciones = np.random.randint(1, 6, n)          # 1-5 hab
antiguedad = np.random.uniform(0, 50, n)           # 0-50 años
precio = metros * 15 + habitaciones * 500 - antiguedad * 20 + np.random.normal(0, 200, n)

print("=== EXPLORACIÓN ===")
print(f"Muestras: {n}")
print(f"Metros²:      min={metros.min():.0f}, max={metros.max():.0f}, media={metros.mean():.0f}")
print(f"Habitaciones: min={habitaciones.min()}, max={habitaciones.max()}")
print(f"Antigüedad:   min={antiguedad.min():.0f}, max={antiguedad.max():.0f}")
print(f"Precio:       min={precio.min():.0f}, max={precio.max():.0f}")

# 2. CONSTRUIR MATRIZ DE FEATURES
X = np.column_stack([metros, habitaciones, antiguedad])
Y = precio.reshape(-1, 1)
print(f"\\nForma X: {X.shape}")  # (200, 3)
print(f"Forma Y: {Y.shape}")    # (200, 1)

# 3. NORMALIZAR (Min-Max al rango 0-1)
X_min, X_max = X.min(axis=0), X.max(axis=0)
Y_min, Y_max = Y.min(), Y.max()
X_norm = (X - X_min) / (X_max - X_min)
Y_norm = (Y - Y_min) / (Y_max - Y_min)
print(f"\\nX normalizado → min: {X_norm.min(axis=0)}, max: {X_norm.max(axis=0)}")

# 4. DIVIDIR EN ENTRENAMIENTO Y PRUEBA (80/20)
indices = np.random.permutation(n)
corte = int(n * 0.8)
X_train = X_norm[indices[:corte]]
Y_train = Y_norm[indices[:corte]]
X_test = X_norm[indices[corte:]]
Y_test = Y_norm[indices[corte:]]
print(f"\\nEntrenamiento: {X_train.shape[0]} muestras")
print(f"Prueba: {X_test.shape[0]} muestras")

# 5. ENTRENAR
modelo = tf.keras.Sequential([
    tf.keras.layers.Dense(16, activation='relu', input_shape=[3]),
    tf.keras.layers.Dense(8, activation='relu'),
    tf.keras.layers.Dense(1)
])
modelo.compile(optimizer='adam', loss='mse')
hist = modelo.fit(X_train, Y_train, epochs=100, validation_data=(X_test, Y_test), verbose=0)

# 6. EVALUAR
print(f"\\n=== RESULTADOS ===")
print(f"Loss entrenamiento: {hist.history['loss'][-1]:.6f}")
print(f"Loss prueba:        {hist.history['val_loss'][-1]:.6f}")

# Desnormalizar predicciones para comparar
pred_norm = modelo.predict(X_test[:5], verbose=0)
pred_real = pred_norm * (Y_max - Y_min) + Y_min
Y_test_real = Y_test[:5] * (Y_max - Y_min) + Y_min
print(f"\\nPrecio Real vs Predicho (5 ejemplos):")
for i in range(5):
    print(f"  Real: {Y_test_real[i,0]:,.0f} vs Pred: {pred_real[i,0]:,.0f}")
\`\`\`

---

## 🔍 Explicación línea por línea

- **\`np.column_stack\`:** Combina arrays 1D en una matriz 2D donde cada array es una columna (feature).
- **\`(X - X_min) / (X_max - X_min)\`:** Normalización Min-Max. Transforma cualquier rango a [0, 1].
- **\`np.random.permutation(n)\`:** Genera índices aleatorios para mezclar los datos antes de dividir.
- **\`validation_data=(X_test, Y_test)\`:** Keras evalúa automáticamente en datos de prueba al final de cada época.
- **\`val_loss\`:** Pérdida en datos de prueba. Si es mucho mayor que \`loss\`, hay **overfitting** (memorización).

---

## 📊 Visualización

\`\`\`
PIPELINE DE DATOS:
  Datos crudos → Explorar → Limpiar → Normalizar → Dividir → ¡Entrenar!

NORMALIZACIÓN MIN-MAX:
  Antes:  metros = [30 ─────────────────────── 250]
          habit  = [1 ── 5]
          años   = [0 ────────── 50]

  Después: todo   = [0.0 ─────────── 1.0]  ← misma escala

DIVISIÓN TRAIN/TEST:
  ┌──────────────────────────────┬─────────┐
  │  80% Entrenamiento (160)     │ 20% Test│
  │  La red aprende de aquí     │ Evaluar │
  └──────────────────────────────┴─────────┘
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: Sin normalización
Entrena directamente con \`X\` e \`Y\` sin normalizar. ¿Qué pasa con la pérdida?

### Experimento 2: 50/50 split
Usa solo 50% para entrenar. ¿La pérdida de prueba mejora o empeora?

### Experimento 3: Más datos
Cambia \`n=200\` a \`n=2000\`. ¿Mejora la predicción?

### Experimento 4: Datos con ruido
Aumenta el ruido: \`np.random.normal(0, 2000, n)\` en vez de 200. ¿Puede la red aprender?

### Experimento 5: Una sola feature
Entrena solo con metros²: \`X = metros.reshape(-1, 1)\`. ¿Qué tan bueno es?

---

## ⚠️ Errores comunes

**Error 1: No normalizar**
Valores grandes dominan el entrenamiento. Features con rango 0-250 tienen más influencia que 0-5.

**Error 2: Filtrar información del test al training**
Calcular la normalización con TODO el dataset (incluyendo test) es un error sutil. En producción, solo tendrías los datos de entrenamiento.

**Error 3: No mezclar antes de dividir**
Si los datos están ordenados (ej: por fecha), dividir sin mezclar pone todo lo viejo en train y lo nuevo en test.

---

## 🏆 Desafío

Crea tu propio dataset sintético de estudiantes: horas de estudio (0-40), horas de sueño (4-10), asistencia (0-100%). Genera notas basadas en estas features. Preprocesa, divide, entrena y evalúa. ¿Qué feature es más importante?

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| Dataset | Colección de ejemplos (X, Y) |
| Feature | Una variable de entrada (columna de X) |
| Normalización | Escalar al rango [0, 1] |
| Train/Test split | 80/20 para detectar memorización |
| Overfitting | Bien en train, mal en test |

---

## 🧠 ¿Qué aprendimos realmente?

El preprocesamiento es el trabajo "invisible" de la IA. Los científicos de datos pasan más tiempo limpiando datos que construyendo modelos. Un modelo simple con datos excelentes supera a un modelo complejo con datos malos. La normalización y la división train/test no son opcionales: son obligatorias.

---

## ➡️ ¿Qué aprenderemos después?

Nuestro modelo es un bloque monolítico. No sabemos qué pasa si lo entrenamos demasiado (overfitting) o si la arquitectura es mala. En la próxima lección aprenderemos sobre **overfitting, underfitting y regularización**: cómo diagnosticar y solucionar los problemas más comunes del entrenamiento.
`
  },
  {
    title: "Overfitting y Regularización - Cuando la Red Memoriza",
    excerpt: "Un modelo que memoriza los datos de entrenamiento falla con datos nuevos. La regularización lo obliga a generalizar.",
    content: `# Lección 12: Overfitting y Regularización — Cuando la Red Memoriza

## 🎯 Objetivo de aprendizaje

**Una sola idea:** **Overfitting** ocurre cuando la red memoriza los datos de entrenamiento en vez de aprender patrones generales. La **regularización** son técnicas para prevenirlo.

---

## ¿Por qué existe este concepto?

Imagina un estudiante que memoriza las respuestas exactas de exámenes anteriores pero no entiende la materia. En el examen real, con preguntas nuevas, fracasa.

Una red neuronal puede hacer lo mismo: obtener pérdida 0 en los datos de entrenamiento pero fallar completamente con datos nuevos. Esto la hace inútil en el mundo real.

---

## Explicación intuitiva

Tres escenarios al estudiar para un examen:

- **Underfitting (estudió poco):** No sabe ni lo básico. Mal en todo.
- **Buen ajuste:** Entiende los conceptos. Bien en preguntas conocidas Y nuevas.
- **Overfitting (memorizó):** Sabe las respuestas exactas del libro. Bien en lo conocido, mal en lo nuevo.

---

## Explicación técnica

**Indicador clave:** Comparar loss de entrenamiento vs prueba.

| Situación | Train Loss | Test Loss | Diagnóstico |
|-----------|-----------|-----------|-------------|
| Ambos altos | 0.5 | 0.6 | Underfitting |
| Ambos bajos | 0.01 | 0.02 | ✅ Buen ajuste |
| Train bajo, test alto | 0.001 | 0.5 | ⚠️ Overfitting |

**Técnicas de regularización:**
1. **Dropout:** Apagar neuronas aleatoriamente durante el entrenamiento
2. **Early stopping:** Detener cuando la pérdida de validación empieza a subir
3. **L2 (Weight decay):** Penalizar pesos grandes en la función de pérdida

---

## 💻 Programa completo

\`\`\`python
# leccion_12_overfitting.py
# Overfitting: el enemigo silencioso de la IA

import numpy as np
import tensorflow as tf

# Datos: función seno con ruido (30 puntos = poco dato)
np.random.seed(42)
X = np.linspace(0, 2 * np.pi, 30).reshape(-1, 1)
Y = np.sin(X) + np.random.normal(0, 0.15, X.shape)

# Dividir
X_train, X_test = X[:24], X[24:]
Y_train, Y_test = Y[:24], Y[24:]

# Modelo SIN regularización (muchas neuronas para poco dato)
modelo_sin = tf.keras.Sequential([
    tf.keras.layers.Dense(64, activation='relu', input_shape=[1]),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(1)
])
modelo_sin.compile(optimizer='adam', loss='mse')
h_sin = modelo_sin.fit(X_train, Y_train, epochs=500,
                        validation_data=(X_test, Y_test), verbose=0)

# Modelo CON regularización (Dropout)
modelo_con = tf.keras.Sequential([
    tf.keras.layers.Dense(64, activation='relu', input_shape=[1]),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(1)
])
modelo_con.compile(optimizer='adam', loss='mse')
h_con = modelo_con.fit(X_train, Y_train, epochs=500,
                        validation_data=(X_test, Y_test), verbose=0)

# Modelo con Early Stopping
modelo_es = tf.keras.Sequential([
    tf.keras.layers.Dense(64, activation='relu', input_shape=[1]),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(1)
])
modelo_es.compile(optimizer='adam', loss='mse')
early_stop = tf.keras.callbacks.EarlyStopping(patience=20, restore_best_weights=True)
h_es = modelo_es.fit(X_train, Y_train, epochs=500,
                      validation_data=(X_test, Y_test),
                      callbacks=[early_stop], verbose=0)

# Comparar
print("=== RESULTADOS ===")
print(f"{'Modelo':<20} {'Train Loss':>12} {'Test Loss':>12} {'Brecha':>10}")
print("-" * 56)
for nombre, h in [("Sin regularización", h_sin), ("Con Dropout", h_con), ("Early Stopping", h_es)]:
    tl = h.history['loss'][-1]
    vl = h.history['val_loss'][-1]
    print(f"{nombre:<20} {tl:12.6f} {vl:12.6f} {vl/max(tl,1e-8):10.1f}x")

# Detalle del early stopping
epocas_usadas = len(h_es.history['loss'])
print(f"\\nEarly stopping detuvo en época {epocas_usadas}/500")
\`\`\`

---

## 🔍 Explicación línea por línea

- **64 neuronas para 24 datos:** Intencionalmente sobredimensionado para provocar overfitting.
- **\`Dropout(0.3)\`:** En cada paso de entrenamiento, apaga el 30% de las neuronas aleatoriamente. Esto fuerza redundancia: ninguna neurona puede ser "imprescindible".
- **\`EarlyStopping(patience=20)\`:** Monitorea la pérdida de validación. Si no mejora en 20 épocas seguidas, detiene el entrenamiento.
- **\`restore_best_weights=True\`:** Guarda los pesos del mejor momento, no del último.
- **Brecha:** Si test_loss/train_loss > 5x, hay overfitting severo.

---

## 📊 Visualización

\`\`\`
OVERFITTING EN EL TIEMPO:
  Loss
  │─── train loss (baja siempre)
  │╲ ╲
  │ ╲  ╲──── val loss (sube después de un punto)
  │  ╲   ╱
  │   ╲ ╱ ← PUNTO ÓPTIMO (early stopping detiene aquí)
  │    ╳
  │   ╱ ╲
  │  ╱   ╲
  └──────────── Épocas

DROPOUT:
  Sin Dropout          Con Dropout (30%)
  ○─○─○─○─○            ○─○─●─○─○      ● = apagada
  │ │ │ │ │            │ │   │ │
  ○─○─○─○─○            ○─●─○─○─●
  │ │ │ │ │            │   │ │
  ○─○─○─○─○            ●─○─○─●─○
  (todas trabajan)     (diferentes cada vez)
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: Más datos
Cambia de 30 a 300 puntos. ¿El overfitting desaparece sin regularización?

### Experimento 2: Modelo más pequeño
Usa \`Dense(4)\` en vez de \`Dense(64)\`. ¿Hace overfitting?

### Experimento 3: Dropout agresivo
Prueba \`Dropout(0.8)\` (apagar 80%). ¿Qué pasa?

### Experimento 4: Visualizar la brecha
\`\`\`python
print("Época | Train  | Val")
for i in range(0, 500, 50):
    t = h_sin.history['loss'][i]
    v = h_sin.history['val_loss'][i]
    print(f"  {i:3d}  | {t:.4f} | {v:.4f} {'⚠️' if v > t*3 else '✅'}")
\`\`\`
> ¿En qué época empieza el overfitting?

### Experimento 5: L2 Regularización
\`\`\`python
from tensorflow.keras import regularizers
modelo_l2 = tf.keras.Sequential([
    tf.keras.layers.Dense(64, activation='relu', input_shape=[1],
                          kernel_regularizer=regularizers.l2(0.01)),
    tf.keras.layers.Dense(64, activation='relu',
                          kernel_regularizer=regularizers.l2(0.01)),
    tf.keras.layers.Dense(1)
])
\`\`\`
> Entrena y compara. L2 penaliza pesos grandes en la loss.

---

## ⚠️ Errores comunes

**Error 1: Evaluar solo con train loss**
"¡Mi modelo tiene loss 0.0001!" — pero ¿en datos de prueba? Siempre mirar val_loss.

**Error 2: Demasiado Dropout**
Dropout 0.9 = casi no hay red. Valores típicos: 0.2-0.5.

**Error 3: No usar restore_best_weights**
Sin esto, EarlyStopping te da los pesos de la última época (ya degradados).

---

## 🏆 Desafío

Entrena un modelo para clasificar datos con solo 50 muestras. Intenta provocar overfitting, luego aplica las 3 técnicas de regularización por separado y compara los resultados en una tabla.

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| Overfitting | Memoriza train, falla en test |
| Underfitting | Ni siquiera aprende lo básico |
| Dropout | Apaga neuronas aleatoriamente |
| Early Stopping | Detiene cuando val_loss sube |
| L2 | Penaliza pesos grandes |
| Indicador | Brecha entre train_loss y val_loss |

---

## 🧠 ¿Qué aprendimos realmente?

El overfitting es el problema #1 en machine learning. No es un fallo de la red, es un fallo de nosotros como ingenieros: le dimos demasiada capacidad para los datos que tiene. La regularización es nuestro kit de herramientas para equilibrar capacidad y generalización.

---

## ➡️ ¿Qué aprenderemos después?

Hasta ahora hemos predicho números (regresión). Pero muchos problemas de IA son de **clasificación**: ¿es gato o perro? ¿es spam o no? En la próxima lección aprenderemos clasificación binaria con la función sigmoid y la pérdida de entropía cruzada.
`
  }
]
