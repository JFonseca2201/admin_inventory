export default {
  // ============================
  // DECIMAL (6 enteros + 2 decimales)
  // ============================
  decimal: {
    beforeMount(el) {
      el.addEventListener("beforeinput", (e) => {
        const input = e.target;
        const char = e.data;
        const value = input.value ?? "";

        // Permitir borrar
        if (char === null) return;

        // Solo números o punto
        if (!/[0-9.]/.test(char)) {
          e.preventDefault();
          return;
        }

        // Convertir "." inicial en "0."
        if (value === "" && char === ".") {
          input.value = "0.";
          e.preventDefault();
          return;
        }

        // Evitar dos puntos
        if (char === "." && value.includes(".")) {
          e.preventDefault();
          return;
        }

        // Simular cómo quedaría el valor después de insertar el nuevo caracter
        const start = input.selectionStart;
        const end = input.selectionEnd;

        const nextValue = value.slice(0, start) + char + value.slice(end);

        // Máximo 6 caracteres en total
        if (nextValue.length > 8) {
          e.preventDefault();
          return;
        }
      });
    },
  },

  // ============================
  // SOLO LETRAS
  // ============================
  letters: {
    beforeMount(el) {
      el.addEventListener("beforeinput", (e) => {
        const char = e.data;
        if (char === null) return;

        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(char)) {
          e.preventDefault();
        }
      });
    },
  },

  // ============================
  // SOLO ENTEROS
  // ============================
  integer: {
    beforeMount(el) {
      el.addEventListener("beforeinput", (e) => {
        const input = e.target;
        const char = e.data;
        const value = input.value ?? "";

        if (char === null) return;

        // Solo números
        if (!/^[0-9]+$/.test(char)) {
          e.preventDefault();
          return;
        }

        // Simular el valor final
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const nextValue = value.slice(0, start) + char + value.slice(end);

        // <-- AQUI el límite de 4
        if (nextValue.length > 4) {
          e.preventDefault();
          return;
        }
      });
    },
  },
};
