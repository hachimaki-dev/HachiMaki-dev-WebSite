// Part 1: Lessons 1-2
export default [
  {
    title: "Python como Calculadora Inteligente",
    excerpt: "Antes de enseñar a las máquinas, necesitamos hablar su idioma. Python será nuestra herramienta de comunicación con la IA.",
    content: `# Lección 1: Python como Calculadora Inteligente

## 🎯 Objetivo de aprendizaje

**Una sola idea:** Aprender que Python puede ejecutar operaciones matemáticas y mostrar resultados, exactamente como una calculadora, pero con superpoderes.

---

## ¿Por qué existe este concepto?

Imagina que quieres enseñar a un robot a reconocer gatos en fotos. Antes de eso, necesitas poder **hablar** con ese robot. Python es ese idioma.

Toda la Inteligencia Artificial se reduce a **matemáticas**. Las redes neuronales son ecuaciones. El aprendizaje es optimización numérica. Si no puedes decirle a la computadora "suma estos números" o "multiplica estas matrices", no puedes hacer IA.

Python no es el único lenguaje que existe, pero es el que la comunidad de IA adoptó masivamente. Las bibliotecas más poderosas (TensorFlow, PyTorch, NumPy) están escritas para Python.

---

## Explicación intuitiva

Piensa en Python como una **calculadora científica con memoria infinita**:

- Una calculadora normal: presionas \`5 + 3\`, aparece \`8\`.
- Python: escribes \`5 + 3\`, aparece \`8\`.

Pero a diferencia de tu calculadora:
- Python puede recordar resultados anteriores
- Puede repetir operaciones millones de veces sin cansarse
- Puede tomar decisiones basadas en los resultados
- Puede procesar miles de datos simultáneamente

---

## Explicación técnica

Python es un **lenguaje interpretado**: escribes instrucciones línea por línea y el intérprete las ejecuta inmediatamente. No necesitas compilar (traducir todo de golpe) como en C o Java.

Los **operadores aritméticos** de Python son:

| Operador | Significado | Ejemplo | Resultado |
|----------|------------|---------|-----------|
| \`+\` | Suma | \`7 + 3\` | \`10\` |
| \`-\` | Resta | \`7 - 3\` | \`4\` |
| \`*\` | Multiplicación | \`7 * 3\` | \`21\` |
| \`/\` | División | \`7 / 3\` | \`2.333...\` |
| \`**\` | Potencia | \`7 ** 2\` | \`49\` |
| \`//\` | División entera | \`7 // 3\` | \`2\` |
| \`%\` | Módulo (resto) | \`7 % 3\` | \`1\` |

La función \`print()\` muestra valores en pantalla. Sin ella, Python calcula pero no te muestra el resultado.

---

## 💻 Programa completo

\`\`\`python
# leccion_01_calculadora.py
# Python como calculadora: las bases matemáticas de la IA

# Operaciones básicas
print("=== OPERACIONES BÁSICAS ===")
print("Suma:      5 + 3  =", 5 + 3)
print("Resta:     10 - 4 =", 10 - 4)
print("Producto:  6 * 7  =", 6 * 7)
print("División:  15 / 4 =", 15 / 4)

# Operaciones que usaremos constantemente en IA
print("\\n=== OPERACIONES PARA IA ===")
print("Potencia:  2 ** 10 =", 2 ** 10)
print("Div entera: 17 // 5 =", 17 // 5)
print("Módulo:    17 % 5  =", 17 % 5)

# Combinando operaciones (respeta PEMDAS)
print("\\n=== ORDEN DE OPERACIONES ===")
print("3 + 4 * 2     =", 3 + 4 * 2)
print("(3 + 4) * 2   =", (3 + 4) * 2)

# ¿Por qué importa en IA? La fórmula de una neurona:
# salida = (entrada1 * peso1) + (entrada2 * peso2) + sesgo
print("\\n=== SIMULANDO UNA NEURONA ===")
print("entrada1=0.5, peso1=0.8")
print("entrada2=0.3, peso2=0.6")
print("sesgo=0.1")
print("Salida:", (0.5 * 0.8) + (0.3 * 0.6) + 0.1)
\`\`\`

---

## 🔍 Explicación línea por línea

- **Línea 1-2:** Los comentarios (\`#\`) son notas para humanos. Python los ignora completamente.
- **\`print("Suma:", 5 + 3)\`:** \`print\` muestra texto en pantalla. La coma separa texto literal (entre comillas) del resultado de la operación.
- **\`2 ** 10\`:** Potencia. En IA usaremos esto constantemente (ej: redes con 2^10 = 1024 neuronas).
- **\`17 // 5\`:** División entera, descarta decimales. Útil para dividir datos en lotes.
- **\`17 % 5\`:** Módulo, devuelve el resto. Útil para saber si un número es par (\`n % 2 == 0\`).
- **\`(0.5 * 0.8) + (0.3 * 0.6) + 0.1\`:** Esto es literalmente cómo funciona una neurona artificial: cada entrada se multiplica por un peso, se suman todos los productos y se agrega un sesgo (bias).

---

## 📊 Visualización

\`\`\`
CALCULADORA NORMAL          PYTHON
┌─────────────────┐         ┌──────────────────────────┐
│  5 + 3 = 8      │         │ >>> print(5 + 3)         │
│                  │         │ 8                        │
│  Solo números    │         │                          │
│  Una operación   │         │ Números, texto, listas   │
│  Sin memoria     │         │ Millones de operaciones  │
└─────────────────┘         │ Memoria infinita         │
                            │ Toma decisiones          │
                            └──────────────────────────┘

UNA NEURONA ARTIFICIAL (lo que acabamos de calcular):

  entrada1 (0.5) ──×── peso1 (0.8) ──┐
                                      ├── SUMA + sesgo (0.1) ──► salida (0.68)
  entrada2 (0.3) ──×── peso2 (0.6) ──┘

  Cálculo: (0.5 × 0.8) + (0.3 × 0.6) + 0.1 = 0.4 + 0.18 + 0.1 = 0.68
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: Predice antes de ejecutar
**Antes de correr este código, escribe en papel qué resultado esperas:**
\`\`\`python
print(2 + 3 * 4)
print((2 + 3) * 4)
\`\`\`
> **Predicción:** ¿Son iguales? ¿Por qué sí o por qué no? Ejecuta y compara.

### Experimento 2: División misteriosa
\`\`\`python
print(10 / 3)
print(10 // 3)
\`\`\`
> **Pregunta:** ¿Por qué dan resultados diferentes? ¿Cuándo usarías cada una?

### Experimento 3: La potencia del 2
\`\`\`python
print(2 ** 0)
print(2 ** 1)
print(2 ** 8)
print(2 ** 32)
\`\`\`
> **Pregunta:** ¿Notas un patrón? ¿Por qué en computación todo se basa en potencias de 2?

### Experimento 4: Modifica la neurona
Cambia los valores de la neurona del programa principal:
\`\`\`python
# Prueba con estos valores y predice el resultado ANTES de ejecutar
print((1.0 * 0.8) + (1.0 * 0.6) + 0.1)  # ¿?
print((0.0 * 0.8) + (0.0 * 0.6) + 0.1)  # ¿?
\`\`\`
> **Reflexión:** Cuando las entradas son 0, ¿qué le queda a la neurona? ¿Qué papel juega el sesgo?

### Experimento 5: Números gigantes
\`\`\`python
print(2 ** 100)
print(10 ** 50)
\`\`\`
> **Observa:** Python maneja números enormes sin problemas. ¿Tu calculadora puede hacer eso?

---

## ⚠️ Errores comunes

**Error 1: Olvidar los paréntesis en print**
\`\`\`python
# ❌ Esto da error
print 5 + 3

# ✅ Correcto
print(5 + 3)
\`\`\`

**Error 2: Usar \`x\` para multiplicar**
\`\`\`python
# ❌ Error: 'x' no es operador
5 x 3

# ✅ Correcto: usar asterisco
5 * 3
\`\`\`

**Error 3: División por cero**
\`\`\`python
# ❌ ZeroDivisionError
print(10 / 0)

# ✅ Siempre verifica el divisor
\`\`\`

---

## 🏆 Desafío

Sin copiar el ejemplo, escribe un programa que calcule:

1. El área de un círculo con radio 5 (usa \`3.14159\` como π)
2. La hipotenusa de un triángulo con catetos 3 y 4 (pista: \`**0.5\` es raíz cuadrada)
3. Simula una neurona con 3 entradas: \`(0.7, 0.2, 0.9)\` con pesos \`(0.4, 0.6, 0.3)\` y sesgo \`0.05\`

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| Python | Lenguaje interpretado, ejecuta línea por línea |
| \`print()\` | Muestra resultados en pantalla |
| Operadores | \`+ - * / ** // %\` |
| PEMDAS | Python respeta el orden matemático |
| Neurona | Es solo: \`(entrada × peso) + sesgo\` |

---

## 🧠 ¿Qué aprendimos realmente?

Aprendimos que Python es una calculadora con superpoderes. Pero lo más importante: **ya simulamos una neurona artificial**. Esa operación simple — multiplicar entradas por pesos, sumar y agregar un sesgo — es el corazón de TODA la inteligencia artificial. Una red neuronal es simplemente millones de esas operaciones encadenadas.

---

## ➡️ ¿Qué aprenderemos después?

Nuestro programa tiene un problema: los números están "pegados" en el código. Si queremos cambiar las entradas de la neurona, debemos reescribir toda la línea. En la próxima lección aprenderemos **variables**: cómo darle nombre a los números para poder reutilizarlos y modificarlos fácilmente. Esto es fundamental porque en IA, los valores cambian constantemente durante el entrenamiento.
`
  },
  {
    title: "Variables - La Memoria de la Máquina",
    excerpt: "Las variables permiten guardar y reutilizar valores. Sin ellas, no podríamos entrenar ningún modelo de IA.",
    content: `# Lección 2: Variables — La Memoria de la Máquina

## 🎯 Objetivo de aprendizaje

**Una sola idea:** Entender que una variable es un **nombre** que apunta a un **valor** almacenado en memoria, y que ese valor puede cambiar.

---

## ¿Por qué existe este concepto?

En la lección anterior, calculamos la salida de una neurona así:
\`\`\`python
print((0.5 * 0.8) + (0.3 * 0.6) + 0.1)
\`\`\`

¿Qué pasa si queremos cambiar las entradas? Debemos buscar cada número y reemplazarlo. Con 3 entradas es manejable. Con 1000 entradas (común en IA), es imposible.

Las **variables** resuelven esto: le pones un nombre a cada valor y luego usas el nombre.

---

## Explicación intuitiva

Imagina una **caja con una etiqueta**:
- La etiqueta es el **nombre** de la variable (\`peso\`)
- El contenido de la caja es el **valor** (\`0.8\`)
- Puedes abrir la caja, sacar el valor actual y poner uno nuevo

En IA, durante el entrenamiento, las cajas de los "pesos" se abren y cierran miles de veces, ajustando sus valores hasta que el modelo aprende.

---

## Explicación técnica

En Python, una variable se crea con el **operador de asignación** \`=\`:
\`\`\`python
peso = 0.8
\`\`\`

Esto NO es una ecuación matemática. No dice "peso es igual a 0.8". Dice: **"almacena el valor 0.8 y llámalo peso"**.

Python tiene **tipos de datos** básicos:
| Tipo | Nombre | Ejemplo | Uso en IA |
|------|--------|---------|-----------|
| Entero | \`int\` | \`42\` | Épocas, contadores |
| Decimal | \`float\` | \`0.001\` | Pesos, learning rate |
| Texto | \`str\` | \`"hola"\` | Etiquetas, nombres |
| Booleano | \`bool\` | \`True\` | ¿Publicado? ¿Entrenado? |

Python detecta el tipo automáticamente (**tipado dinámico**).

---

## 💻 Programa completo

\`\`\`python
# leccion_02_variables.py
# Variables: dándole memoria a nuestros cálculos

# Nuestra neurona, ahora con variables
entrada1 = 0.5
entrada2 = 0.3
peso1 = 0.8
peso2 = 0.6
sesgo = 0.1

# Cálculo claro y legible
salida = (entrada1 * peso1) + (entrada2 * peso2) + sesgo
print("Salida de la neurona:", salida)

# Ahora cambiar valores es trivial
print("\\n=== CAMBIANDO ENTRADAS ===")
entrada1 = 1.0
entrada2 = 0.0
salida = (entrada1 * peso1) + (entrada2 * peso2) + sesgo
print("Nueva salida:", salida)

# Los tipos de datos
print("\\n=== TIPOS DE DATOS ===")
epocas = 1000              # int: número entero
tasa_aprendizaje = 0.001   # float: número decimal
nombre_modelo = "MiRedV1"  # str: texto
entrenado = False           # bool: verdadero/falso

print("Épocas:", epocas, "| Tipo:", type(epocas))
print("Tasa:", tasa_aprendizaje, "| Tipo:", type(tasa_aprendizaje))
print("Nombre:", nombre_modelo, "| Tipo:", type(nombre_modelo))
print("¿Entrenado?:", entrenado, "| Tipo:", type(entrenado))

# Operaciones entre variables
print("\\n=== SIMULACIÓN DE ENTRENAMIENTO ===")
error_actual = 15.7
for i in range(5):
    error_actual = error_actual * 0.7   # El error se reduce
    print(f"  Época {i+1}: error = {error_actual:.2f}")
\`\`\`

---

## 🔍 Explicación línea por línea

- **\`entrada1 = 0.5\`:** Crea una caja llamada \`entrada1\` con el valor \`0.5\` dentro.
- **\`salida = (entrada1 * peso1) + ...\`:** Python reemplaza cada nombre por su valor, calcula el resultado y lo guarda en \`salida\`.
- **\`entrada1 = 1.0\`:** Abre la caja \`entrada1\`, saca el \`0.5\` y pone \`1.0\`. El valor anterior se pierde.
- **\`type(epocas)\`:** Función que te dice qué tipo de dato contiene la variable.
- **\`f"Época {i+1}"\`:** f-string, permite insertar variables dentro de texto usando llaves \`{}\`.
- **\`{error_actual:.2f}\`:** Formatea el número con 2 decimales.
- **\`error_actual = error_actual * 0.7\`:** Toma el valor actual, lo multiplica por 0.7, y guarda el resultado de vuelta. La variable se actualiza.

---

## 📊 Visualización

\`\`\`
SIN VARIABLES (Lección 1):          CON VARIABLES (Lección 2):

print((0.5*0.8)+(0.3*0.6)+0.1)      entrada1 = 0.5
                                     peso1 = 0.8
¿Qué es 0.5? ¿Qué es 0.8?          salida = entrada1 * peso1 + ...
No se entiende nada.                 
                                     ¡Se lee como lenguaje humano!

MEMORIA DE PYTHON:
┌──────────────┬───────┐
│ entrada1     │  0.5  │ ← después se convierte en 1.0
├──────────────┼───────┤
│ peso1        │  0.8  │
├──────────────┼───────┤
│ sesgo        │  0.1  │
├──────────────┼───────┤
│ salida       │  0.68 │ ← se recalcula automáticamente
└──────────────┴───────┘
\`\`\`

---

## 🧪 Experimentos guiados

### Experimento 1: La variable que cambia
\`\`\`python
x = 10
print(x)
x = 20
print(x)
x = x + 5
print(x)
\`\`\`
> **Predice los 3 valores antes de ejecutar.** ¿Qué significa \`x = x + 5\` si NO es una ecuación?

### Experimento 2: ¿Qué tipo soy?
\`\`\`python
a = 5
b = 5.0
c = "5"
print(type(a), type(b), type(c))
print(a + b)    # ¿Funciona?
print(a + c)    # ¿Funciona?
\`\`\`
> **Predice:** ¿Qué línea dará error y por qué?

### Experimento 3: El intercambio
\`\`\`python
a = 10
b = 20
a = b
b = a
print("a =", a, "b =", b)
\`\`\`
> **Predice:** ¿Se intercambiaron? ¿Por qué no? ¿Cómo lo arreglarías?

### Experimento 4: Nombres válidos
\`\`\`python
mi_variable = 1     # ¿Funciona?
miVariable = 2      # ¿Funciona?
2variable = 3       # ¿Funciona?
mi-variable = 4     # ¿Funciona?
\`\`\`
> **Ejecuta línea por línea.** ¿Cuáles son nombres válidos y por qué?

### Experimento 5: La neurona evoluciona
\`\`\`python
peso = 0.5
entrada = 1.0
for i in range(10):
    salida = entrada * peso
    peso = peso + 0.1  # El peso "aprende"
    print(f"Paso {i}: peso={peso:.1f}, salida={salida:.1f}")
\`\`\`
> **Observa:** El peso cambia en cada paso. Esto es el corazón del entrenamiento en IA.

---

## ⚠️ Errores comunes

**Error 1: Usar una variable antes de crearla**
\`\`\`python
# ❌ NameError: name 'resultado' is not defined
print(resultado)
resultado = 42
\`\`\`

**Error 2: Confundir = con ==**
\`\`\`python
x = 5     # Asignación: guarda 5 en x
x == 5    # Comparación: ¿x es igual a 5? Devuelve True/False
\`\`\`

**Error 3: Mayúsculas importan**
\`\`\`python
Peso = 0.5
print(peso)  # ❌ NameError: 'peso' no existe, solo 'Peso'
\`\`\`

---

## 🏆 Desafío

Crea un programa que simule una neurona con **4 entradas**. Usa variables con nombres descriptivos. Luego:
1. Calcula e imprime la salida
2. Modifica solo la entrada 3 y recalcula
3. Muestra cómo cambia la salida cuando una sola entrada cambia

No copies el ejemplo. Usa tus propios valores.

---

## 📋 Resumen

| Concepto | Detalle |
|----------|---------|
| Variable | Nombre que apunta a un valor en memoria |
| Asignación \`=\` | Almacena un valor (NO es igualdad matemática) |
| Tipos | \`int\`, \`float\`, \`str\`, \`bool\` |
| \`type()\` | Revela el tipo de una variable |
| f-string | \`f"texto {variable}"\` para insertar valores |
| Reasignación | Una variable puede cambiar de valor |

---

## 🧠 ¿Qué aprendimos realmente?

Las variables son la **memoria** de nuestros programas. Sin ellas, cada cálculo se pierde después de ejecutarse. En IA, los "pesos" de una red neuronal son simplemente variables que se ajustan durante el entrenamiento. Cuando decimos "el modelo aprendió", lo que realmente pasó es que las variables de los pesos encontraron los valores correctos.

---

## ➡️ ¿Qué aprenderemos después?

Ahora sabemos guardar un valor en una variable. Pero ¿qué pasa si necesitamos guardar **mil valores**? No vamos a crear mil variables (\`peso1\`, \`peso2\`, ... \`peso1000\`). En la próxima lección aprenderemos **listas**: una sola variable que contiene muchos valores ordenados. Las listas son el antepasado de los tensores, la estructura fundamental de toda IA moderna.
`
  }
]
