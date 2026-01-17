<script setup>
const router = useRouter();
const isProductDeleteDialogVisible = ref(false);
const isImportExcelProductDialogVisible = ref(false);
const isProductShowDialogVisible = ref(false);
const product_selected_show = ref(null);
const currentPage = ref(1);
const totalPage = ref(0);

const list_products = ref([]);
const sucursales = ref([]);
const warehouses = ref([]);
const units = ref([]);
const categories = ref([]);
const searchQuery = ref(null);
const product_categorie_id = ref(null);
const warehouse_stock_id = ref(null);
const unit_stock_id = ref(null);
const sucursale_price_id = ref(null);
const disponibilidad = ref(null);
const is_gift = ref(null);
const product_selected_delete = ref(null);

const isLoading = ref(null);
const isSearching = ref(false);
const list = async () => {
  isLoading.value = true;
  try {
    let data = {
      search: searchQuery.value,
      product_categorie_id: product_categorie_id.value,
      warehouse_id: warehouse_stock_id.value,
      unit_id: unit_stock_id.value,
      sucursale_id: sucursale_price_id.value,
      disponibilidad: disponibilidad.value,
      is_gift: is_gift.value,
    };
    const resp = await $api("products/index?page=" + currentPage.value, {
      method: "POST",
      body: data,
      onResponseError({ response }) {
        console.log(response._data.error);
      },
    });
    console.log(resp);
    list_products.value = resp.products.data;
    totalPage.value = resp.total_page;
    if (currentPage.value > totalPage.value && totalPage.value > 0) {
      currentPage.value = 1;
    }
  } catch (error) {
    console.log(error);
  } finally {
    isLoading.value = false;
    isSearching.value = false;
  }
};

/* watch(currentPage, (val) => {
  console.log(val);
  list();
}); */
watch(currentPage, () => {
  if (!isSearching.value) {
    list();
  }
});

const reset = () => {
  searchQuery.value = "";
  product_categorie_id.value = null;
  warehouse_stock_id.value = null;
  unit_stock_id.value = null;
  sucursale_price_id.value = null;
  disponibilidad.value = null;
  is_gift.value = null;
  currentPage.value = 1;
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
    sucursales.value = resp.sucursales;
    warehouses.value = resp.warehouses;
    units.value = resp.units;
    categories.value = resp.categories;
  } catch (error) {
    console.log(error);
  }
};

const downloadExcel = () => {
  let QUERY_PARAMS = "";
  if (searchQuery.value) {
    QUERY_PARAMS += "&search=" + searchQuery.value;
  }
  if (product_categorie_id.value) {
    QUERY_PARAMS += "&product_categorie_id=" + product_categorie_id.value;
  }
  if (warehouse_stock_id.value) {
    QUERY_PARAMS += "&warehouse_id=" + warehouse_stock_id.value;
  }
  if (unit_stock_id.value) {
    QUERY_PARAMS += "&unit_id=" + unit_stock_id.value;
  }
  if (sucursale_price_id.value) {
    QUERY_PARAMS += "&sucursale_id=" + sucursale_price_id.value;
  }
  if (is_gift.value) {
    QUERY_PARAMS += "&is_gift=" + is_gift.value;
  }
  if (disponibilidad.value) {
    QUERY_PARAMS += "&disponibilidad=" + disponibilidad.value;
  }
  window.open(
    import.meta.env.VITE_API_BASE_URL + "products-excel?z=1" + QUERY_PARAMS,
    "_blank",
  );
};

const importProducts = () => {
  list();
};

const addDeleteProduct = (Product) => {
  console.log(Product);
  let backup = list_products.value;
  list_products.value = [];
  let INDEX = backup.findIndex((product) => product.id == Product.id);
  if (INDEX != -1) {
    backup.splice(INDEX, 1);
  }
  setTimeout(() => {
    list_products.value = backup;
  }, 50);
};
const showItem = (item) => {
  product_selected_show.value = item;
  isProductShowDialogVisible.value = true;
};

const editItem = (product) => {
  console.log(product);
  router.push({
    name: "product-edit-id",
    params: {
      id: product.id,
    },
  });
};
const deleteItem = (item) => {
  isProductDeleteDialogVisible.value = true;
  product_selected_delete.value = item;
};

const avatarText = (value) => {
  if (!value) return "";
  const nameArray = value.split(" ");

  return nameArray.map((word) => word.charAt(0).toUpperCase()).join("");
};

function formatDateYMD(dateString) {
  const date = new Date(Date.parse(dateString));

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

onMounted(() => {
  list();
  config();
});

definePage({ meta: { permission: "list_product" } });
</script>

<template>
  <div>
    <VCard title="🛞 Productos">
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
                  placeholder="Search Product"
                  density="compact"
                  class="me-3"
                  v-model="searchQuery"
                  @keyup.enter="list"
                />
              </VCol>
              <VCol cols="3">
                <VSelect
                  placeholder="Select"
                  label="Categoría"
                  :items="categories"
                  item-title="name"
                  item-value="id"
                  v-model="product_categorie_id"
                >
                </VSelect>
              </VCol>
              <VCol cols="3" md="3">
                <VSelect
                  :items="warehouses"
                  item-title="name"
                  item-value="id"
                  placeholder="Select"
                  v-model="warehouse_stock_id"
                  label="Almacenes"
                />
              </VCol>
              <VCol cols="3" md="3">
                <VSelect
                  :items="units"
                  item-title="name"
                  item-value="id"
                  placeholder="Select"
                  v-model="unit_stock_id"
                  label="Unidades"
                />
              </VCol>
              <VCol cols="4" md="3">
                <VSelect
                  :items="sucursales"
                  item-title="name"
                  item-value="id"
                  placeholder="Select"
                  label="Sucursales"
                  v-model="sucursale_price_id"
                />
              </VCol>
              <VCol cols="4" md="3">
                <VSelect
                  placeholder="Select"
                  label="Disponibilidad"
                  :items="[
                    {
                      id: 1,
                      title: 'Vender sin Stock',
                    },
                    {
                      id: 2,
                      title: 'No Vender sin Stock',
                    },
                  ]"
                  item-title="title"
                  item-value="id"
                  v-model="disponibilidad"
                >
                </VSelect>
              </VCol>
              <VCol cols="3" md="2">
                <VSelect
                  placeholder="Select"
                  label="¿Regalo?"
                  :items="[
                    {
                      id: 1,
                      title: 'NO',
                    },
                    {
                      id: 2,
                      title: 'SI',
                    },
                  ]"
                  item-title="title"
                  item-value="id"
                  v-model="is_gift"
                >
                </VSelect>
              </VCol>
              <VCol cols="4" md="4" class="justify-end, nowrap d-flex">
                <VBtn
                  color="info"
                  class="mx-1"
                  prepend-icon="ri-search-2-line"
                  @click="list()"
                >
                  <VTooltip activator="parent" location="top"
                    >Buscar productos</VTooltip
                  >
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
                <VBtn
                  color="success"
                  class="mx-1"
                  prepend-icon="ri-file-excel-2-line"
                  @click="downloadExcel()"
                >
                  <VTooltip activator="parent" location="top"
                    >Exportar productos</VTooltip
                  >
                </VBtn>
                <VBtn
                  color="primary"
                  class="mx-1"
                  prepend-icon="ri-file-excel-line"
                  @click="
                    isImportExcelProductDialogVisible =
                      !isImportExcelProductDialogVisible
                  "
                >
                  <VTooltip activator="parent" location="top"
                    >Importar productos</VTooltip
                  >
                </VBtn>
              </VCol>
            </VRow>
          </VCol>
          <VCol cols="2" class="text-end">
            <VBtn @click="router.push({ name: 'product-add' })">
              Add Product
              <VIcon end icon="ri-add-line" />
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
      <template v-if="list_products.length == 0">
        <VCardText class="text-center text-body-large">
          No se encontraron productos.
        </VCardText>
      </template>

      <template v-else>
        <VTable>
          <thead>
            <tr>
              <th class="text-uppercase">Producto</th>
              <th class="text-uppercase">Código</th>
              <th class="text-uppercase">Categoría</th>
              <!-- <th class="text-uppercase">¿Regalo?</th>
            <th class="text-uppercase">¿Descuento?</th> -->
              <!-- <th class="text-uppercase">IVA(%)</th> -->
              <th class="text-uppercase">Garantía</th>
              <th class="text-uppercase">Estado</th>
              <th class="text-uppercase">Registro</th>
              <th class="text-uppercase">Acción</th>
            </tr>
          </thead>

          <tbody class="text-uppercase">
            <tr v-for="item in list_products" :key="item.id">
              <td>
                <div class="d-flex align-center">
                  <VAvatar
                    size="32"
                    :color="item.imagen ? '' : 'primary'"
                    :class="
                      item.imagen ? '' : 'v-avatar-light-bg primary--text'
                    "
                    :variant="!item.imagen ? 'tonal' : undefined"
                  >
                    <VImg v-if="item.imagen" :src="item.imagen" />
                    <span v-else class="text-sm">{{
                      avatarText(item.title)
                    }}</span>
                  </VAvatar>
                  <div class="d-flex flex-column ms-3">
                    {{ item.title }}
                  </div>
                </div>
                <div>
                  <VChip
                    color="primary"
                    size="x-small"
                    variant="tonal"
                    v-if="item.state_stock == 1"
                  >
                    Disponible
                  </VChip>
                  <VChip
                    color="warning"
                    size="x-small"
                    variant="tonal"
                    v-if="item.state_stock == 2"
                  >
                    Por agotar
                  </VChip>
                  <VChip
                    color="error"
                    size="x-small"
                    variant="tonal"
                    v-if="item.state_stock == 3"
                  >
                    Agotado
                  </VChip>
                </div>
              </td>
              <td>
                {{ item.sku }}
              </td>
              <td>
                {{ item.product_categorie.name }}
              </td>
              <!-- <td>
              {{ item.is_gift == 1 ? "NO" : "SI" }}
            </td>
            <td>
              {{ item.is_discount == 1 ? "NO" : "SI" }}

              <span v-if="item.is_discount == 2"
                >( {{ item.max_discount }} %)</span
              >
            </td> -->
              <!-- <td>{{ item.importe_iva }} %</td> -->
              <td>{{ item.warranty_day }} días.</td>
              <td>
                <VChip color="primary" v-if="item.state == 1"> Activo </VChip>
                <VChip color="error" v-if="item.state == 2"> Inactivo </VChip>
              </td>

              <td style="white-space: nowrap">
                {{ formatDateYMD(item.created_at) }}
              </td>
              <td>
                <div class="d-flex gap-1">
                  <IconBtn size="small" @click="showItem(item)">
                    <VIcon icon="ri-eye-line" />
                  </IconBtn>
                  <IconBtn size="small" @click="editItem(item)">
                    <VIcon icon="ri-pencil-line" />
                  </IconBtn>
                  <IconBtn size="small" @click="deleteItem(item)">
                    <VIcon icon="ri-delete-bin-line" />
                  </IconBtn>
                </div>
              </td>
            </tr>
          </tbody>
        </VTable>
        <VPagination
          v-model="currentPage"
          :length="totalPage"
          rounded="circle"
        />
      </template>
    </VCard>

    <ImportExcelProduct
      v-model:isDialogVisible="isImportExcelProductDialogVisible"
      @importExcelProduct="importProducts()"
    >
    </ImportExcelProduct>

    <ProductDeleteDialog
      v-if="product_selected_delete && isProductDeleteDialogVisible"
      v-model:isDialogVisible="isProductDeleteDialogVisible"
      :productSelected="product_selected_delete"
      @deleteUser="addDeleteProduct"
    ></ProductDeleteDialog>

    <ProductShow
      v-if="product_selected_show && isProductShowDialogVisible"
      v-model:isDialogVisible="isProductShowDialogVisible"
      :productSelected="product_selected_show"
    ></ProductShow>
  </div>
</template>
