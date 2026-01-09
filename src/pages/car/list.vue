<script setup>
import { ref, onMounted } from "vue";

const headers = [
  { title: "ID", key: "id" },
  { title: "Marca", key: "brand" },
  { title: "Modelo", key: "model" },
  { title: "Tipo de vehículo", key: "type_car" },
  { title: "Placa", key: "placa" },
  { title: "Estado", key: "state" },
  { title: "Observación", key: "observation" },
  { title: "Fecha de registro", key: "created_at" },
  { title: "Action", key: "action" },
];

const isCarAddDialogVisible = ref(false);
const isCarsEditDialogVisible = ref(false);
const isCarDeleteDialogVisible = ref(false);

const list_cars = ref([]);
const searchQuery = ref(null);
const car_selected_edit = ref(null);
const car_selected_delete = ref(null);

const isLoading = ref(false); // ⬅ loader global para la tabla

const list = async () => {
  try {
    isLoading.value = true; // mostrar overlay
    const resp = await $api(
      "cars?search=" + (searchQuery.value ? searchQuery.value : ""),
      {
        method: "GET",
        onResponseError({ response }) {
          console.log(response._data.error);
        },
      },
    );
    list_cars.value = resp.cars;
  } catch (error) {
    console.log(error);
  } finally {
    isLoading.value = false; // ocultar overlay
  }
};

const addNewCar = (NewCar) => {
  let backup = [...list_cars.value];
  backup.unshift(NewCar);
  list_cars.value = backup;
};

const addEditCar = (editCar) => {
  let backup = [...list_cars.value];
  const INDEX = backup.findIndex((rol) => rol.id == editCar.id);
  if (INDEX !== -1) backup[INDEX] = editCar;
  list_cars.value = backup;
};

const addDeleteCar = (Car) => {
  let backup = [...list_cars.value];
  const INDEX = backup.findIndex((rol) => rol.id == Car.id);
  if (INDEX !== -1) backup.splice(INDEX, 1);
  list_cars.value = backup;
};

const editItem = (item) => {
  car_selected_edit.value = item;
  isCarsEditDialogVisible.value = true;
};
const deleteItem = (item) => {
  car_selected_delete.value = item;
  isCarDeleteDialogVisible.value = true;
};

onMounted(() => {
  list();
});

definePage({ meta: { permission: "list_car" } });
</script>

<template>
  <div>
    <!-- Overlay global para la tabla -->
    <VOverlay
      :model-value="isLoading"
      class="align-center justify-center"
      absolute
    >
      <VProgressCircular indeterminate size="50" width="5" color="primary" />
    </VOverlay>

    <VCard title="🚗 Cars">
      <VCardText>
        <VRow class="justify-space-between">
          <VCol cols="3">
            <VTextField
              placeholder="Search Car"
              density="compact"
              class="me-3"
              v-model="searchQuery"
              @keyup.enter="list"
            />
          </VCol>
          <VCol cols="2" class="text-end">
            <VBtn @click="isCarAddDialogVisible = !isCarAddDialogVisible">
              Add Car
              <VIcon end icon="ri-add-line" />
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
      <VDataTable
        :headers="headers"
        :items="list_cars"
        :items-per-page="10"
        class="text-no-wrap"
      >
        <template #item.id="{ item }"
          ><span class="text-h6">{{ item.id }}</span></template
        >
        <template #item.brand="{ item }"
          ><span class="text-h6">{{ item.brand }}</span></template
        >
        <template #item.model="{ item }"
          ><span class="text-h6">{{ item.model }}</span></template
        >
        <template #item.type_car="{ item }"
          ><span class="text-h6">{{ item.type_car }}</span></template
        >
        <template #item.placa="{ item }"
          ><span class="text-h6">{{ item.placa }}</span></template
        >
        <template #item.state="{ item }">
          <VChip color="primary" v-if="item.state == 1">Activo</VChip>
          <VChip color="error" v-if="item.state == 2">Inactivo</VChip>
        </template>
        <template #item.observation="{ item }"
          ><span class="text-h6">{{ item.observation }}</span></template
        >
        <template #item.action="{ item }">
          <div class="d-flex gap-1">
            <IconBtn size="small" @click="editItem(item)"
              ><VIcon icon="ri-pencil-line"
            /></IconBtn>
            <IconBtn size="small" @click="deleteItem(item)"
              ><VIcon icon="ri-delete-bin-line"
            /></IconBtn>
          </div>
        </template>
      </VDataTable>
    </VCard>

    <CarAddDialog
      v-model:isDialogVisible="isCarAddDialogVisible"
      @addCar="addNewCar"
    />
    <CarsEditDialog
      v-if="car_selected_edit && isCarsEditDialogVisible"
      v-model:isDialogVisible="isCarsEditDialogVisible"
      :carSelected="car_selected_edit"
      @editCar="addEditCar"
    />
    <CarDeleteDialog
      v-if="car_selected_delete && isCarDeleteDialogVisible"
      v-model:isDialogVisible="isCarDeleteDialogVisible"
      :carSelected="car_selected_delete"
      @deleteCar="addDeleteCar"
    />
  </div>
</template>
