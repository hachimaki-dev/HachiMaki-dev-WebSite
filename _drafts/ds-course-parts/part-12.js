// Part 12: Lesson 12 - Proyecto Final
export default [
  {
    title: "Proyecto Final - EDA Completo del Titanic",
    excerpt: "Pon todo junto: carga, limpieza, exploración, visualización y preparación de datos en un análisis exploratorio completo.",
    content: `# Lección 12: Proyecto Final — EDA Completo del Titanic

## 🎯 Objetivo de aprendizaje

**Una sola idea:** Realizar un Análisis Exploratorio de Datos (EDA) completo e integrador, aplicando todas las técnicas aprendidas en el curso sobre un dataset real.

---

## Requisitos previos

- **Todas las lecciones anteriores de este curso (0-11).**
- **Curso 1:** Python, NumPy, funciones.

## ⏱️ Tiempo estimado: 60 minutos

---

## ¿Por qué existe este concepto?

Este proyecto integra todo lo aprendido. En las lecciones anteriores practicaste cada herramienta por separado. Ahora las combinarás en un flujo de trabajo profesional: el **EDA (Exploratory Data Analysis)**.

Todo científico de datos hace un EDA antes de entrenar cualquier modelo. Es como un doctor que examina al paciente antes de operar: sin diagnóstico, la operación puede salir mal.

---

## Explicación intuitiva

Un EDA es como ser detective de datos:
1. **La escena del crimen** → Cargar y ver los datos
2. **Recolectar pistas** → Estadísticas descriptivas
3. **Buscar sospechosos** → Valores faltantes, outliers
4. **Conectar los puntos** → Correlaciones, patrones por grupo
5. **El informe final** → Gráficos y conclusiones

---

## Explicación técnica

Un EDA profesional sigue estos pasos:

| Fase | Objetivo | Herramientas |
|------|----------|-------------|
| 1. Carga | Obtener los datos | \`pd.read_csv()\` |
| 2. Inspección | Dimensiones, tipos, muestras | \`shape\`, \`info()\`, \`head()\` |
| 3. Limpieza | Faltantes, duplicados | \`isnull()\`, \`fillna()\`, \`dropna()\` |
| 4. Univariado | Distribución de cada variable | Histogramas, \`value_counts()\` |
| 5. Bivariado | Relación entre pares | Scatter, boxplot, \`corr()\` |
| 6. Multivariado | Patrones complejos | \`groupby\`, \`pivot_table\`, heatmap |
| 7. Hallazgos | Conclusiones y preparación | Resumen, pipeline NumPy |

---

## 💻 Programa completo

\`\`\`python
# leccion_12_proyecto_final.py
# EDA Completo del Titanic — Integrando todo el curso

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# =============================================
# FASE 1: CARGA DE DATOS
# =============================================
print("=" * 60)
print("FASE 1: CARGA DE DATOS")
print("=" * 60)
url = "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv"
df = pd.read_csv(url)
print(f"Dataset cargado: {df.shape[0]} filas × {df.shape[1]} columnas")

# =============================================
# FASE 2: INSPECCIÓN INICIAL
# =============================================
print("\\n" + "=" * 60)
print("FASE 2: INSPECCIÓN INICIAL")
print("=" * 60)
print(f"\\nPrimeras filas:")
print(df.head())
print(f"\\nTipos de datos:")
print(df.dtypes)
print(f"\\nEstadísticas numéricas:")
print(df.describe().round(2))
print(f"\\nEstadísticas categóricas:")
print(df.describe(include="object"))

# =============================================
# FASE 3: LIMPIEZA DE DATOS
# =============================================
print("\\n" + "=" * 60)
print("FASE 3: LIMPIEZA DE DATOS")
print("=" * 60)

# 3a. Diagnóstico de faltantes
print("\\nDiagnóstico de faltantes:")
faltantes = df.isnull().sum()
pct = (df.isnull().mean() * 100).round(1)
diagnostico = pd.DataFrame({"faltantes": faltantes, "porcentaje": pct})
print(diagnostico[diagnostico["faltantes"] > 0])

# 3b. Aplicar estrategias
df_clean = df.copy()
df_clean["Age"] = df_clean["Age"].fillna(df_clean["Age"].median())
df_clean["Embarked"] = df_clean["Embarked"].fillna(df_clean["Embarked"].mode().iloc[0])
df_clean = df_clean.drop(columns=["Cabin"])  # 77% faltante

print(f"\\nDespués de limpieza: {df_clean.isnull().sum().sum()} faltantes")
print(f"Forma: {df_clean.shape}")

# =============================================
# FASE 4: ANÁLISIS UNIVARIADO
# =============================================
print("\\n" + "=" * 60)
print("FASE 4: ANÁLISIS UNIVARIADO")
print("=" * 60)

fig, axes = plt.subplots(2, 3, figsize=(15, 9))
fig.suptitle("ANÁLISIS UNIVARIADO — Titanic", fontsize=16, fontweight="bold")

# Histograma de edad
axes[0, 0].hist(df_clean["Age"], bins=30, color="#8b5cf6", edgecolor="white")
axes[0, 0].axvline(df_clean["Age"].median(), color="red", linestyle="--")
axes[0, 0].set_title("Distribución de Edad")
axes[0, 0].set_xlabel("Edad")

# Histograma de tarifa
axes[0, 1].hist(df_clean["Fare"], bins=30, color="#06b6d4", edgecolor="white")
axes[0, 1].set_title("Distribución de Tarifa")
axes[0, 1].set_xlim(0, 200)

# Supervivencia
surv_counts = df_clean["Survived"].value_counts()
axes[0, 2].bar(["No sobrevivió", "Sobrevivió"], surv_counts.values, 
               color=["#ef4444", "#22c55e"])
for i, v in enumerate(surv_counts.values):
    axes[0, 2].text(i, v + 10, f"{v} ({v/len(df_clean)*100:.0f}%)", ha="center")
axes[0, 2].set_title("Supervivencia")

# Clase
clase_counts = df_clean["Pclass"].value_counts().sort_index()
axes[1, 0].bar(clase_counts.index.astype(str), clase_counts.values,
               color=["#8b5cf6", "#06b6d4", "#f59e0b"])
axes[1, 0].set_title("Pasajeros por Clase")

# Sexo
sex_counts = df_clean["Sex"].value_counts()
axes[1, 1].bar(sex_counts.index, sex_counts.values, color=["#60a5fa", "#f472b6"])
axes[1, 1].set_title("Distribución por Sexo")

# Puerto
emb_counts = df_clean["Embarked"].value_counts()
axes[1, 2].bar(emb_counts.index, emb_counts.values, color=["#22c55e", "#f59e0b", "#ef4444"])
axes[1, 2].set_title("Puerto de Embarque")

plt.tight_layout()
plt.show()

# =============================================
# FASE 5: ANÁLISIS BIVARIADO
# =============================================
print("\\n" + "=" * 60)
print("FASE 5: ANÁLISIS BIVARIADO")
print("=" * 60)

fig, axes = plt.subplots(2, 2, figsize=(12, 10))
fig.suptitle("ANÁLISIS BIVARIADO — Titanic", fontsize=16, fontweight="bold")

# Supervivencia por sexo
surv_sex = df_clean.groupby("Sex")["Survived"].mean()
axes[0, 0].bar(surv_sex.index, surv_sex.values, color=["#60a5fa", "#f472b6"])
axes[0, 0].set_title("Supervivencia por Sexo")
axes[0, 0].set_ylabel("Tasa")
for i, v in enumerate(surv_sex.values):
    axes[0, 0].text(i, v + 0.02, f"{v:.0%}", ha="center", fontweight="bold")

# Supervivencia por clase
surv_class = df_clean.groupby("Pclass")["Survived"].mean()
axes[0, 1].bar(surv_class.index.astype(str), surv_class.values,
               color=["#8b5cf6", "#06b6d4", "#f59e0b"])
axes[0, 1].set_title("Supervivencia por Clase")
for i, v in enumerate(surv_class.values):
    axes[0, 1].text(i, v + 0.02, f"{v:.0%}", ha="center", fontweight="bold")

# Boxplot de edad por supervivencia
sns.boxplot(data=df_clean, x="Survived", y="Age", palette={0: "#ef4444", 1: "#22c55e"}, ax=axes[1, 0])
axes[1, 0].set_title("Edad por Supervivencia")
axes[1, 0].set_xticklabels(["No sobrevivió", "Sobrevivió"])

# Scatter edad vs tarifa
colores = df_clean["Survived"].map({0: "#ef4444", 1: "#22c55e"})
axes[1, 1].scatter(df_clean["Age"], df_clean["Fare"], c=colores, alpha=0.4, s=15)
axes[1, 1].set_title("Edad vs Tarifa")
axes[1, 1].set_xlabel("Edad")
axes[1, 1].set_ylabel("Tarifa")
axes[1, 1].set_ylim(0, 300)

plt.tight_layout()
plt.show()

# =============================================
# FASE 6: ANÁLISIS MULTIVARIADO
# =============================================
print("\\n" + "=" * 60)
print("FASE 6: ANÁLISIS MULTIVARIADO")
print("=" * 60)

# Tabla dinámica
print("\\nTabla dinámica de supervivencia:")
pivot = pd.pivot_table(df_clean, values="Survived", index="Pclass", 
                       columns="Sex", aggfunc="mean").round(3)
print(pivot)

# Heatmap de correlaciones
fig, axes = plt.subplots(1, 2, figsize=(14, 5))
fig.suptitle("ANÁLISIS MULTIVARIADO", fontsize=16, fontweight="bold")

cols_num = ["Survived", "Pclass", "Age", "SibSp", "Parch", "Fare"]
corr = df_clean[cols_num].corr()
sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", center=0, ax=axes[0])
axes[0].set_title("Correlaciones")

# Supervivencia por sexo y clase
sns.barplot(data=df_clean, x="Pclass", y="Survived", hue="Sex",
            palette={"male": "#60a5fa", "female": "#f472b6"}, ax=axes[1])
axes[1].set_title("Supervivencia por Clase y Sexo")
axes[1].set_ylabel("Tasa de Supervivencia")

plt.tight_layout()
plt.show()

# =============================================
# FASE 7: HALLAZGOS Y CONCLUSIONES
# =============================================
print("\\n" + "=" * 60)
print("FASE 7: HALLAZGOS Y CONCLUSIONES")
print("=" * 60)

print("""
📊 REPORTE DE HALLAZGOS — TITANIC

1. SUPERVIVENCIA GENERAL:
   - Solo el 38.4% de los pasajeros sobrevivió.

2. SEXO (factor más determinante):
   - Mujeres: 74.2% sobrevivieron
   - Hombres: 18.9% sobrevivieron
   - Las mujeres tuvieron 3.9x más probabilidad.

3. CLASE SOCIAL:
   - 1ra clase: 63.0% sobrevivieron
   - 2da clase: 47.3%
   - 3ra clase: 24.2%
   - La clase era un predictor fuerte de supervivencia.

4. INTERACCIÓN SEXO × CLASE:
   - Mujeres de 1ra clase: 96.8% sobrevivieron (casi todas)
   - Hombres de 3ra clase: 13.5% (muy pocos)

5. EDAD:
   - Los niños (<12 años) tuvieron mejor supervivencia.
   - La edad sola no fue tan determinante como sexo o clase.

6. TARIFA:
   - Correlación positiva con supervivencia (+0.26)
   - Pero mediada por la clase: tarifas altas = clase alta = mejor posición.

7. CALIDAD DE DATOS:
   - Age tenía 19.9% faltantes → imputados con mediana (28.0)
   - Cabin tenía 77.1% faltantes → columna eliminada
   - Embarked: solo 2 faltantes → filas eliminables

CONCLUSIÓN: "Women and children first" no fue solo un mito.
La clase social determinó quién tenía acceso a los botes salvavidas.
""")

# =============================================
# BONUS: PREPARAR PARA MODELADO
# =============================================
print("=" * 60)
print("BONUS: DATOS LISTOS PARA MODELO")
print("=" * 60)

df_model = df_clean[["Survived", "Pclass", "Sex", "Age", "SibSp", "Parch", "Fare", "Embarked"]].copy()
df_encoded = pd.get_dummies(df_model, columns=["Sex", "Embarked"], drop_first=True)

y = df_encoded["Survived"].values
X = df_encoded.drop(columns=["Survived"]).values.astype(float)

X_min, X_max = X.min(axis=0), X.max(axis=0)
rango = X_max - X_min
rango[rango == 0] = 1
X_norm = (X - X_min) / rango

np.random.seed(42)
idx = np.random.permutation(len(X_norm))
n_train = int(0.8 * len(X_norm))
X_train, X_test = X_norm[idx[:n_train]], X_norm[idx[n_train:]]
y_train, y_test = y[idx[:n_train]], y[idx[n_train:]]

print(f"X_train: {X_train.shape}, y_train: {y_train.shape}")
print(f"X_test: {X_test.shape}, y_test: {y_test.shape}")
print(f"Features: {list(df_encoded.drop(columns=['Survived']).columns)}")
print("\\n✅ Datos preparados para model.fit(X_train, y_train)")
print("📎 En el Curso 3, usarás estos datos para entrenar modelos de ML.")
\`\`\`

---

## 🔍 Explicación del flujo

Este proyecto NO introduce conceptos nuevos. Integra todo lo que aprendiste:

- **Fase 1-2:** Lecciones 1-3 (cargar, inspeccionar)
- **Fase 3:** Lección 4 (datos faltantes)
- **Fase 4:** Lecciones 5, 8 (filtrar, histogramas)
- **Fase 5:** Lecciones 6, 8-9 (groupby, scatter, boxplot)
- **Fase 6:** Lecciones 6, 9 (pivot_table, heatmap, correlaciones)
- **Fase 7:** Síntesis de hallazgos
- **Bonus:** Lección 11 (pipeline a NumPy)

---

## 📊 Visualización

\`\`\`
FLUJO DE UN EDA PROFESIONAL:

  📁 Archivo CSV
    ↓
  🔍 Inspección (shape, info, head, describe)
    ↓
  🧹 Limpieza (faltantes, outliers, tipos)
    ↓
  📊 Análisis Univariado (distribución de cada variable)
    ↓
  📈 Análisis Bivariado (relaciones entre pares)
    ↓
  🔥 Análisis Multivariado (patrones complejos)
    ↓
  📝 Hallazgos y Conclusiones
    ↓
  🤖 Preparar para Modelado (opcional)
\`\`\`

---

## 🏆 Desafío Final

Realiza un EDA completo sobre el dataset \`"penguins"\` de Seaborn. Tu reporte debe incluir:
1. Inspección y limpieza de datos
2. Al menos 4 gráficos diferentes
3. Análisis por especie
4. 5 hallazgos escritos en formato de reporte
5. Datos preparados para modelado (predecir especie)

<details>
<summary>Ver solución (estructura)</summary>

\`\`\`python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Carga y limpieza
penguins = sns.load_dataset("penguins").dropna().copy()
print(f"Datos: {penguins.shape}")
print(penguins.info())

# Univariado
fig, axes = plt.subplots(2, 2, figsize=(12, 8))
sns.histplot(data=penguins, x="bill_length_mm", hue="species", kde=True, ax=axes[0,0])
sns.histplot(data=penguins, x="body_mass_g", hue="species", kde=True, ax=axes[0,1])
sns.countplot(data=penguins, x="species", palette="viridis", ax=axes[1,0])
sns.countplot(data=penguins, x="island", hue="species", ax=axes[1,1])
plt.tight_layout()
plt.show()

# Bivariado
sns.pairplot(penguins, hue="species", palette="viridis", diag_kind="hist")
plt.show()

# Multivariado
resumen = penguins.groupby("species").agg(
    masa_media=("body_mass_g", "mean"),
    pico_largo=("bill_length_mm", "mean"),
    aleta_media=("flipper_length_mm", "mean"),
    cantidad=("species", "count")
).round(1)
print(resumen)

# Hallazgos
print("\\n1. Gentoo son los más grandes (masa ~5076g vs ~3706g Adelie)")
print("2. Chinstrap tienen el pico más largo (~48.8mm)")
print("3. bill_length + flipper_length separan bien las 3 especies")
print("4. Adelie vive en las 3 islas; Gentoo solo en Biscoe")
print("5. La masa corporal y largo de aleta están altamente correlacionados")

# Pipeline a NumPy
df_encoded = pd.get_dummies(penguins.drop(columns=["species"]), drop_first=True)
species_map = {"Adelie": 0, "Chinstrap": 1, "Gentoo": 2}
y = penguins["species"].map(species_map).values
X = df_encoded.values.astype(float)
X_norm = (X - X.min(axis=0)) / (X.max(axis=0) - X.min(axis=0))
print(f"\\nListo: X={X_norm.shape}, y={y.shape}")
\`\`\`
</details>

---

## 🧠 Autoevaluación

1. **¿Cuáles son las 7 fases de un EDA?** → Carga, Inspección, Limpieza, Univariado, Bivariado, Multivariado, Hallazgos
2. **¿Qué factor fue más determinante en la supervivencia del Titanic?** → El sexo (mujeres 74% vs hombres 19%)
3. **¿Por qué es importante hacer EDA antes de entrenar un modelo?** → Para entender los datos, detectar problemas y elegir las features correctas

---

## 📖 Glosario

| Término | Definición |
|---------|-----------|
| **EDA** | Exploratory Data Analysis: análisis exploratorio de datos |
| **análisis univariado** | Examinar cada variable por separado |
| **análisis bivariado** | Examinar la relación entre dos variables |
| **análisis multivariado** | Examinar patrones entre múltiples variables |
| **pipeline** | Secuencia de pasos de procesamiento aplicados en orden |

---

## 📋 Resumen del Curso Completo

| Lección | Concepto Clave |
|---------|---------------|
| 0 | Setup: Pandas, Matplotlib, Seaborn |
| 1 | DataFrame: la tabla de Python |
| 2 | Cargar CSV/Excel con problemas reales |
| 3 | Explorar: info(), describe(), isnull() |
| 4 | Datos faltantes: dropna(), fillna() |
| 5 | Filtrar: loc, iloc, condiciones booleanas |
| 6 | Agrupar: groupby, pivot_table |
| 7 | Combinar: merge, concat |
| 8 | Matplotlib: histogramas, scatter, líneas |
| 9 | Seaborn: heatmap, boxplot, pairplot |
| 10 | Outliers: IQR, decisiones |
| 11 | DataFrame → NumPy: encoding, normalización |
| 12 | Proyecto Final: EDA completo |

---

## 🎓 ¿Qué sigue después de este curso?

¡Felicidades! Completaste el Curso 2. Ahora sabes:
- Cargar cualquier dataset del mundo real
- Limpiarlo y prepararlo
- Visualizar patrones y relaciones
- Convertirlo en arrays listos para modelado

En el **Curso 3** (próximamente), aplicarás estas habilidades para entrenar modelos de Machine Learning: regresión lineal, árboles de decisión, y más. Pero ahora la diferencia es que TÚ prepararás los datos — ya no llegarán perfectos como en el Curso 1.

El EDA que aprendiste hoy es la habilidad que separa a un científico de datos novato de uno profesional. Un modelo es tan bueno como los datos que lo alimentan.
`
  }
]
