# import os
# import sys
# import tensorflow as tf
# from tensorflow.keras.preprocessing.image import ImageDataGenerator

# import matplotlib.pyplot as plt
# from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping,ReduceLROnPlateau


# # -------------------------------------------------------------------
# # AUTO-DETECT DATASET FOLDER INSIDE: D:\emotion _music _app\datasets
# # -------------------------------------------------------------------
# BASE_DATASET_DIR = r"D:\emotion _music _app\datasets"

# train_dir = None
# test_dir = None

# # Scan all folders inside datasets/
# for folder in os.listdir(BASE_DATASET_DIR):
#     full_path = os.path.join(BASE_DATASET_DIR, folder)

#     if not os.path.isdir(full_path):
#         continue

#     # Check if this folder contains train/ and test/
#     t_dir = os.path.join(full_path, "train")
#     tt_dir = os.path.join(full_path, "test")

#     if os.path.isdir(t_dir) and os.path.isdir(tt_dir):
#         train_dir = t_dir
#         test_dir = tt_dir
#         print(f"✔ Dataset Found in: {full_path}")
#         break

# # If still not found → STOP program
# if train_dir is None or test_dir is None:
#     print("❌ ERROR: Could not find train/ and test/ folders in datasets/")
#     sys.exit(1)

# print("Train Folder:", train_dir)
# print("Test Folder :", test_dir)
# # -------------------------------------------------------------------
# # END OF AUTOMATIC DATASET DETECTION
# # -------------------------------------------------------------------


# # ------------------------------------------------------
# # IMAGE DATA GENERATOR
# # ------------------------------------------------------
# IMG_SIZE = (48, 48)
# BATCH_SIZE = 32

# train_datagen = ImageDataGenerator(
#     rescale=1./255,
#     horizontal_flip=True,
#     zoom_range=0.2,
#     width_shift_range=0.1,  # Shift left/right
#     height_shift_range=0.1, # Shift up/down
#     shear_range=0.1
# )

# test_datagen = ImageDataGenerator(rescale=1./255)

# train_data = train_datagen.flow_from_directory(
#     train_dir,
#     target_size=IMG_SIZE,
#     batch_size=BATCH_SIZE,
#     class_mode="categorical"
# )

# test_data = test_datagen.flow_from_directory(
#     test_dir,
#     target_size=IMG_SIZE,
#     batch_size=BATCH_SIZE,
#     class_mode="categorical"
# )


# # ------------------------------------------------------
# # CNN MODEL
# # ------------------------------------------------------
# model = tf.keras.Sequential([
#     tf.keras.layers.Conv2D(32, (3, 3), padding="same",activation='relu', input_shape=(48, 48, 3)),
#     tf.keras.layers.MaxPooling2D(2, 2),
#    tf.keras.layers.Dropout(0.2),

#     tf.keras.layers.Conv2D(64, (3, 3), padding="same",activation='relu'),
#     tf.keras.layers.MaxPooling2D(2, 2),
#    tf.keras.layers.Dropout(0.2),

#     tf.keras.layers.Conv2D(128, (3, 3),padding="same", activation='relu'),
#     tf.keras.layers.MaxPooling2D(2, 2),
#     tf.keras.layers.Dropout(0.2),

#     tf.keras.layers.Flatten(),
#     tf.keras.layers.Dense(128, activation='relu'),
#     tf.keras.layers.Dropout(0.2),
#     tf.keras.layers.Dense(train_data.num_classes, activation='softmax')
# ])

# model.compile(
#     optimizer='adam',
#     loss='categorical_crossentropy',
#     metrics=['accuracy']
# )

# model.summary()

# # ------------------------------------------------------
# # TRAIN MODEL
# # ------------------------------------------------------
# EPOCHS = 30
# checkpoint = ModelCheckpoint(
#     'cnn_emotion_model.h5',             # File name to save
#     monitor='val_accuracy',      # Watch the "Validation Accuracy" score
#     save_best_only=True,         # Only save if this epoch is better than the last
#     mode='max',                  # We want the accuracy to be MAXimum
#     verbose=1
# )
# early_stopping = EarlyStopping(
#     monitor='val_loss',          # Watch the "Validation Loss" (Errors)
#     patience=5,                  # If errors don't drop for 5 epochs...
#     restore_best_weights=True,   # ...stop and go back to the best version
#     verbose=1
# )
# history = model.fit(
#     train_data,
#     validation_data=test_data,
#     callbacks=[checkpoint,early_stopping],
#     epochs=EPOCHS
# )

# # ------------------------------------------------------
# # SAVE MODEL
# # ------------------------------------------------------
# # model.save("cnn_emotion_model.h5")
# # print("✔ Model saved as emotion_cnn_model.h5")

# # OPTIONAL: Save as TFLite
# converter = tf.lite.TFLiteConverter.from_keras_model(model)
# tflite_model = converter.convert()

# with open("emotion_model.tflite", "wb") as f:
#     f.write(tflite_model)

# print("✔ TFLite model saved as emotion_model.tflite")

# # 1. Grab the history
# acc = history.history['accuracy']
# val_acc = history.history['val_accuracy']
# loss = history.history['loss']
# val_loss = history.history['val_loss']

# epochs_range = range(len(acc))

# # 2. Plot Accuracy
# plt.figure(figsize=(14, 5))
# plt.subplot(1, 2, 1)
# plt.plot(epochs_range, acc, label='Training Accuracy')
# plt.plot(epochs_range, val_acc, label='Validation Accuracy')
# plt.legend(loc='lower right')
# plt.title('Training and Validation Accuracy')

# # 3. Plot Loss
# plt.subplot(1, 2, 2)
# plt.plot(epochs_range, loss, label='Training Loss')
# plt.plot(epochs_range, val_loss, label='Validation Loss')
# plt.legend(loc='upper right')
# plt.title('Training and Validation Loss')
# plt.show()
# ==========================================================
# IMPORT LIBRARIES
# ==========================================================
# import os
# import sys
# import numpy as np
# import tensorflow as tf
# import matplotlib.pyplot as plt

# from tensorflow.keras.preprocessing.image import ImageDataGenerator
# from tensorflow.keras.callbacks import (
#     ModelCheckpoint,
#     EarlyStopping,
#     ReduceLROnPlateau
# )

# # ==========================================================
# # AUTO-DETECT DATASET FOLDER
# # ==========================================================
# BASE_DATASET_DIR = r"D:\emotion _music _app\datasets"

# train_dir = None
# test_dir = None

# for folder in os.listdir(BASE_DATASET_DIR):
#     full_path = os.path.join(BASE_DATASET_DIR, folder)

#     if not os.path.isdir(full_path):
#         continue

#     t_dir = os.path.join(full_path, "train")
#     tt_dir = os.path.join(full_path, "test")

#     if os.path.isdir(t_dir) and os.path.isdir(tt_dir):
#         train_dir = t_dir
#         test_dir = tt_dir
#         print(f"✔ Dataset Found in: {full_path}")
#         break

# if train_dir is None or test_dir is None:
#     print("❌ ERROR: train/ test/ folders not found")
#     sys.exit(1)

# print("Train Folder:", train_dir)
# print("Test Folder :", test_dir)

# # ==========================================================
# # IMAGE DATA GENERATORS (WITH AUGMENTATION)
# # ==========================================================
# IMG_SIZE = (48, 48)
# BATCH_SIZE = 32

# train_datagen = ImageDataGenerator(
#     rescale=1./255,
#     horizontal_flip=True,
#     zoom_range=0.2,
#     width_shift_range=0.1,
#     height_shift_range=0.1,
#     shear_range=0.1
# )

# test_datagen = ImageDataGenerator(rescale=1./255)

# train_data = train_datagen.flow_from_directory(
#     train_dir,
#     target_size=IMG_SIZE,
#     batch_size=BATCH_SIZE,
#     class_mode="categorical"
# )

# test_data = test_datagen.flow_from_directory(
#     test_dir,
#     target_size=IMG_SIZE,
#     batch_size=BATCH_SIZE,
#     class_mode="categorical"
# )

# # ==========================================================
# # IMPROVED CNN MODEL
# # ==========================================================
# model = tf.keras.Sequential([

#     # -------- Block 1 --------
#     tf.keras.layers.Conv2D(32, (3,3), padding="same", activation='relu',
#                            input_shape=(48,48,3)),
#     tf.keras.layers.BatchNormalization(),
#     tf.keras.layers.MaxPooling2D(2,2),
#     tf.keras.layers.Dropout(0.25),

#     # -------- Block 2 --------
#     tf.keras.layers.Conv2D(64, (3,3), padding="same", activation='relu'),
#     tf.keras.layers.BatchNormalization(),
#     tf.keras.layers.MaxPooling2D(2,2),
#     tf.keras.layers.Dropout(0.25),

#     # -------- Block 3 --------
#     tf.keras.layers.Conv2D(128, (3,3), padding="same", activation='relu'),
#     tf.keras.layers.BatchNormalization(),
#     tf.keras.layers.MaxPooling2D(2,2),
#     tf.keras.layers.Dropout(0.25),

#     # -------- Fully Connected --------
#     tf.keras.layers.Flatten(),
#     tf.keras.layers.Dense(256, activation='relu'),
#     tf.keras.layers.BatchNormalization(),
#     tf.keras.layers.Dropout(0.5),

#     tf.keras.layers.Dense(train_data.num_classes, activation='softmax')
# ])

# model.compile(
#     optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
#     loss='categorical_crossentropy',
#     metrics=['accuracy']
# )

# model.summary()

# # ==========================================================
# # CALLBACKS (SMART TRAINING)
# # ==========================================================
# checkpoint = ModelCheckpoint(
#     "best_emotion_model.h5",
#     monitor="val_accuracy",
#     save_best_only=True,
#     mode="max",
#     verbose=1
# )

# early_stopping = EarlyStopping(
#     monitor="val_loss",
#     patience=7,
#     restore_best_weights=True,
#     verbose=1
# )

# reduce_lr = ReduceLROnPlateau(
#     monitor="val_loss",
#     factor=0.5,
#     patience=3,
#     min_lr=1e-6,
#     verbose=1
# )

# # ==========================================================
# # TRAIN MODEL
# # ==========================================================
# EPOCHS = 50

# history = model.fit(
#     train_data,
#     validation_data=test_data,
#     epochs=EPOCHS,
#     callbacks=[checkpoint, early_stopping, reduce_lr]
# )

# # ==========================================================
# # SAVE TFLITE MODEL
# # ==========================================================
# converter = tf.lite.TFLiteConverter.from_keras_model(model)
# tflite_model = converter.convert()

# with open("emotion_model.tflite", "wb") as f:
#     f.write(tflite_model)

# print("✔ TFLite model saved as emotion_model.tflite")

# # ==========================================================
# # SMOOTHING FUNCTION FOR GRAPHS
# # ==========================================================
# def smooth_curve(points, factor=0.8):
#     smoothed = []
#     for p in points:
#         if smoothed:
#             smoothed.append(smoothed[-1]*factor + p*(1-factor))
#         else:
#             smoothed.append(p)
#     return smoothed

# acc = smooth_curve(history.history['accuracy'])
# val_acc = smooth_curve(history.history['val_accuracy'])
# loss = smooth_curve(history.history['loss'])
# val_loss = smooth_curve(history.history['val_loss'])

# epochs_range = range(len(acc))

# # ==========================================================
# # PLOT SMOOTHED ACCURACY & LOSS
# # ==========================================================
# plt.figure(figsize=(14,5))

# plt.subplot(1,2,1)
# plt.plot(epochs_range, acc, label='Training Accuracy')
# plt.plot(epochs_range, val_acc, label='Validation Accuracy')
# plt.legend()
# plt.title('Smoothed Training & Validation Accuracy')

# plt.subplot(1,2,2)
# plt.plot(epochs_range, loss, label='Training Loss')
# plt.plot(epochs_range, val_loss, label='Validation Loss')
# plt.legend()
# plt.title('Smoothed Training & Validation Loss')

# plt.show()
# ==========================================================
# IMPORT LIBRARIES
# ==========================================================
import os
import sys
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt

from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import (
    ModelCheckpoint,
    EarlyStopping,
    ReduceLROnPlateau
)

# ==========================================================
# AUTO-DETECT DATASET FOLDER
# ==========================================================
BASE_DATASET_DIR = r"D:\emotion _music _app\datasets\archive (5)"

train_dir = "/kaggle/input/datasetbyadi/train"
test_dir  = "/kaggle/input/datasetbyadi/test"

print("Train dir:", train_dir)
print("Test dir :", test_dir)
print("Classes  :", os.listdir(train_dir))


for folder in os.listdir(BASE_DATASET_DIR):
    full_path = os.path.join(BASE_DATASET_DIR, folder)

    if not os.path.isdir(full_path):
        continue

    t_dir = os.path.join(full_path, "train")
    tt_dir = os.path.join(full_path, "test")

    if os.path.isdir(t_dir) and os.path.isdir(tt_dir):
        train_dir = t_dir
        test_dir = tt_dir
        print(f"✔ Dataset Found in: {full_path}")
        break

if train_dir is None or test_dir is None:
    print("❌ ERROR: train/ test/ folders not found")
    sys.exit(1)

print("Train Folder:", train_dir)
print("Test Folder :", test_dir)

# ==========================================================
# IMAGE DATA GENERATORS (WITH AUGMENTATION)
# ==========================================================
IMG_SIZE = (48, 48)
BATCH_SIZE = 32

train_datagen = ImageDataGenerator(
    rescale=1./255,
    horizontal_flip=True,
    zoom_range=0.15,           # ↓ from 0.2
    width_shift_range=0.05,    # ↓ from 0.1
    height_shift_range=0.05,   # ↓ from 0.1
    shear_range=0.05           # ↓ from 0.1
)


test_datagen = ImageDataGenerator(rescale=1./255)

train_data = train_datagen.flow_from_directory(
    train_dir,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical"
)

test_data = test_datagen.flow_from_directory(
    test_dir,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical"
)

# ==========================================================
# IMPROVED CNN MODEL
# ==========================================================
model = tf.keras.Sequential([

    # -------- Block 1 --------
    tf.keras.layers.Conv2D(32, (3,3), padding="same", activation='relu',
                           input_shape=(48,48,3)),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.MaxPooling2D(2,2),
    tf.keras.layers.Dropout(0.15),

    # -------- Block 2 --------
    tf.keras.layers.Conv2D(64, (3,3), padding="same", activation='relu'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.MaxPooling2D(2,2),
    tf.keras.layers.Dropout(0.15),

    # -------- Block 3 --------
    tf.keras.layers.Conv2D(128, (3,3), padding="same", activation='relu'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.MaxPooling2D(2,2),
    tf.keras.layers.Dropout(0.15),

    # -------- Fully Connected --------
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(256, activation='relu'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.4),

    tf.keras.layers.Dense(train_data.num_classes, activation='softmax')
])



model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.0005),
    loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
    metrics=["accuracy"]
)

model.summary()

# ==========================================================
# CALLBACKS (SMART TRAINING)
# ==========================================================
checkpoint = ModelCheckpoint(
    "best_emotion_model.h5",
    monitor="val_accuracy",
    save_best_only=True,
    mode="max",
    verbose=1
)

early_stopping = EarlyStopping(
    monitor="val_loss",
    patience=7,
    restore_best_weights=True,
    verbose=1
)

reduce_lr = ReduceLROnPlateau(
    monitor="val_loss",
    factor=0.5,
    patience=3,
    min_lr=1e-6,
    verbose=1
)

# ==========================================================
# TRAIN MODEL
# ==========================================================
EPOCHS = 50

history = model.fit(
    train_data,
    validation_data=test_data,
    epochs=EPOCHS,
    callbacks=[checkpoint, early_stopping, reduce_lr]
)

# ==========================================================
# SAVE TFLITE MODEL
# ==========================================================
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

with open("emotion_model.tflite", "wb") as f:
    f.write(tflite_model)

print("✔ TFLite model saved as emotion_model.tflite")

# ==========================================================
# SMOOTHING FUNCTION FOR GRAPHS
# ==========================================================
def smooth_curve(points, factor=0.8):
    smoothed = []
    for p in points:
        if smoothed:
            smoothed.append(smoothed[-1]*factor + p*(1-factor))
        else:
            smoothed.append(p)
    return smoothed

acc = smooth_curve(history.history['accuracy'])
val_acc = smooth_curve(history.history['val_accuracy'])
loss = smooth_curve(history.history['loss'])
val_loss = smooth_curve(history.history['val_loss'])

epochs_range = range(len(acc))

# ==========================================================
# PLOT SMOOTHED ACCURACY & LOSS
# ==========================================================
plt.figure(figsize=(14,5))

plt.subplot(1,2,1)
plt.plot(epochs_range, acc, label='Training Accuracy')
plt.plot(epochs_range, val_acc, label='Validation Accuracy')
plt.legend()
plt.title('Smoothed Training & Validation Accuracy')

plt.subplot(1,2,2)
plt.plot(epochs_range, loss, label='Training Loss')
plt.plot(epochs_range, val_loss, label='Validation Loss')
plt.legend()
plt.title('Smoothed Training & Validation Loss')

plt.show()
