<script setup>
const router = useRouter();
const isConversionDeleteDialogVisible = ref(false);
const isConversionAddDialogVisible = ref(false);

const currentPage = ref(1);
const totalPage = ref(0);

const list_conversions = ref([]);
const warehouses = ref([]);
const units = ref([]);
const searchQuery = ref(null);
const warehouse_id = ref(null);
const unit_start_id = ref(null);
const unit_end_id = ref(null);
const range_date = ref(null);
const conversion_id = ref(null);

const selected_conversion_delete = ref(null);
const isLoading = ref(false);
const list = async () => {
  isLoading.value = true;
  try {
    let data = {
      search_product: searchQuery.value,
      warehouse_id: warehouse_id.value,
      //unit_id: unit_id.value,
      start_date: range_date.value
        ? range_date.value.split("to")[0].trim()
        : null,
      end_date: range_date.value
        ? range_date.value.split("to")[1].trim()
        : null,
      conversion_id: conversion_id.value,
      unit_start_id: unit_start_id.value,
      unit_end_id: unit_end_id.value,
    };
    console.log(data);

    const resp = await $api("conversions/index?page=" + currentPage.value, {
      method: "POST",
      body: data,
      onResponseError({ response }) {
        console.log(response._data.error);
      },
    });
    console.log(resp);
    list_conversions.value = resp.conversions.data;
    totalPage.value = resp.total_page;
  } catch (error) {
    console.log(error);
  } finally {
    isLoading.value = false;
  }
};

watch(currentPage, (val) => {
  console.log(val);
  list();
});

const reset = () => {
  searchQuery.value = "";
  warehouse_id.value = null;
  //unit_id.value = null;
  currentPage.value = 1;
  range_date.value = null;
  unit_start_id.value = null;
  unit_end_id.value = null;
  conversion_id.value = null;
  list();
};

const config = async () => {
  try {
    const resp = await $api("products/config", {
      method: "GET",
      onResponseError({ response }) {
        console.log(response._data.error);
      },
    });
    console.log(resp);
    warehouses.value = resp.warehouses;
    units.value = resp.units;
  } catch (error) {
    console.log(error);
  }
};

const openCreateConversion = () => {
  isConversionAddDialogVisible.value = true;
};

const conversionProductAdd = (NewConversion) => {
  list_conversions.value.unshift(NewConversion);
};

const conversionDelete = (Conversion) => {
  let INDEX = list_conversions.value.findIndex(
    (conversion) => conversion.id == Conversion.id,
  );
  if (INDEX != -1) {
    list_conversions.value.splice(INDEX, 1);
  }
};

const deleteItem = (Conversion) => {
  isConversionDeleteDialogVisible.value = true;
  selected_conversion_delete.value = Conversion;
};

onMounted(() => {
  list();
  config();
});

definePage({ meta: { permission: "conversions" } });
</script>

<template>
  <div>
    <VCard title="🗂️ Conversión de unidades">
      <VOverlay
        :model-value="isLoading"
        class="align-center justify-center"
        absolute
      >
        <VProgressCircular indeterminate size="50" width="5" color="primary" />
      </VOverlay>
      <VCardText>
        <VRow class="">
          <VCol cols="10">
            <VRow>
              <VCol cols="3">
                <VTextField
                  placeholder="Search N° de registro"
                  density="compact"
                  class="me-3"
                  v-model="conversion_id"
                  @keyup.enter="list"
                />
              </VCol>

              <VCol cols="3">
                <VTextField
                  placeholder="Search Product"
                  density="compact"
                  class="me-3"
                  v-model="searchQuery"
                  @keyup.enter="list"
                />
              </VCol>

              <VCol cols="3">
                <VSelect
                  :items="warehouses"
                  item-title="name"
                  item-value="id"
                  placeholder="Select"
                  v-model="warehouse_id"
                  label="Almacenes"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="3">
                <VSelect
                  :items="units"
                  item-title="name"
                  item-value="id"
                  placeholder="Select"
                  v-model="unit_start_id"
                  label="Unidad inicial"
                />
              </VCol>
              <VCol cols="3">
                <VSelect
                  :items="units"
                  item-title="name"
                  item-value="id"
                  placeholder="Select"
                  v-model="unit_end_id"
                  label="Unidade final"
                />
              </VCol>

              <VCol cols="3">
                <AppDateTimePicker
                  v-model="range_date"
                  label="Rango de fecha"
                  placeholder="Select date"
                  density="compact"
                  :config="{ mode: 'range' }"
                />
              </VCol>
              <VCol cols="3" class="d-flex gap-1">
                <VBtn
                  color="info"
                  class="mx-1"
                  prepend-icon="ri-search-2-line"
                  @click="list()"
                >
                  <VTooltip activator="parent" location="top">Buscar</VTooltip>
                </VBtn>
                <VBtn
                  color="secondary"
                  class="mx-1"
                  prepend-icon="ri-restart-line"
                  @click="reset()"
                >
                  <VTooltip activator="parent" location="top"
                    >Refrescar</VTooltip
                  >
                </VBtn>
              </VCol>
            </VRow>
          </VCol>
          <VCol cols="2" class="text-end">
            <VBtn @click="openCreateConversion()">
              Add Conversion
              <VIcon end icon="ri-add-line" />
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>

      <VTable>
        <thead>
          <tr>
            <th class="text-uppercase">N° Conv.</th>

            <th class="text-uppercase">Producto</th>
            <th class="text-uppercase">Almacen</th>
            <th class="text-uppercase">Un. Inicial</th>
            <th class="text-uppercase">Un. Final</th>

            <th class="text-uppercase">Cant. Inicial</th>

            <th class="text-uppercase">Cant. Final</th>
            <th class="text-uppercase">F. Registro</th>
            <th class="text-uppercase">Acción</th>
          </tr>
        </thead>

        <tbody class="text-uppercase">
          <tr v-for="conversion in list_conversions" :key="conversion.id">
            <td>{{ conversion.id }}</td>
            <td>
              <div class="d-flex align-center">
                <VAvatar
                  size="32"
                  :color="conversion.product.imagen ? '' : 'primary'"
                  :class="
                    conversion.product.imagen
                      ? ''
                      : 'v-avatar-light-bg primary--text'
                  "
                  :variant="!conversion.product.imagen ? 'tonal' : undefined"
                >
                  <VImg
                    v-if="conversion.product.imagen"
                    :src="conversion.product.imagen"
                  />
                  <span v-else class="text-sm">{{
                    avatarText(conversion.product.title)
                  }}</span>
                </VAvatar>
                <div class="d-flex flex-column ms-3">
                  {{ conversion.product.title }}
                </div>
              </div>
            </td>
            <td>
              {{ conversion.warehouse.name }}
            </td>
            <td>
              {{ conversion.unit_start.name }}
            </td>
            <td>
              {{ conversion.unit_end.name }}
            </td>
            <td>
              {{ conversion.quantity_start }}
            </td>
            <td>
              {{ conversion.quantity_end }}
            </td>
            <td>
              {{ conversion.created_at }}
            </td>
            <td>
              <div class="d-flex gap-1">
                <IconBtn size="small" @click="deleteItem(conversion)">
                  <VIcon icon="ri-delete-bin-line" />
                </IconBtn>
              </div>
            </td>
          </tr>
        </tbody>
      </VTable>
      <VPagination v-model="currentPage" :length="totalPage" rounded="circle" />
    </VCard>

    <ConversionAddDialog
      v-if="warehouses.length > 0"
      v-model:isDialogVisible="isConversionAddDialogVisible"
      @addConversion="conversionProductAdd"
      v-model:warehouses="warehouses"
      :units="units"
    >
    </ConversionAddDialog>

    <ConversionDeleteDialog
      v-if="selected_conversion_delete && isConversionDeleteDialogVisible"
      v-model:isDialogVisible="isConversionDeleteDialogVisible"
      :conversionSelected="selected_conversion_delete"
      @deleteConversion="conversionDelete"
    >
    </ConversionDeleteDialog>
  </div>
</template>
