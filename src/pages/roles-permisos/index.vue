<script setup>
const data = ref([]);
const colors = [
  "primary",
  "secondary",
  "success",
  "info",
  "warning",
  "error",
  "purple",
  "indigo",
  "teal",
  "cyan",
  "deep-purple",
  "pink",
  "amber",
  "lime",
  "brown",
];
const headers = [
  {
    title: "ID",
    key: "id",
    width: "50px",
  },
  {
    title: "Role",
    key: "name",
    width: "180px",
  },
  {
    title: "Fecha de registro",
    key: "created_at",
    width: "130px",
  },
  {
    title: "Permisos",
    key: "permissions_pluck",
  },
  {
    title: "Action",
    key: "action",
  },
];
const isRoleAddDialogVisible = ref(false);
const isRoleEditDialogVisible = ref(false);
const isRoleDeleteDialogVisible = ref(false);

const list_roles = ref([]);
const searchQuery = ref(null);
const role_selected_edit = ref(null);
const role_selected_delete = ref(null);

const isLoading = ref(false);

const list = async () => {
  isLoading.value = true;
  try {
    const resp = await $api(
      "role?search=" + (searchQuery.value ? searchQuery.value : ""),
      {
        method: "GET",
        onResponseError({ response }) {
          console.log(response._data.error);
        },
      },
    );
    console.log(resp);
    list_roles.value = resp.roles;
  } catch (error) {
    console.log(error);
  } finally {
    isLoading.value = false;
  }
};

const getRandomColor = () => {
  return colors[Math.floor(Math.random() * colors.length)];
};
const addNewRole = (NewRole) => {
  console.log(NewRole);
  let backup = list_roles.value;
  list_roles.value = [];
  backup.unshift(NewRole);
  setTimeout(() => {
    list_roles.value = backup;
  }, 50);
};

const addEditRole = (editRole) => {
  console.log(editRole);
  let backup = list_roles.value;
  list_roles.value = [];
  let INDEX = backup.findIndex((rol) => rol.id == editRole.id);
  if (INDEX != -1) {
    backup[INDEX] = editRole;
  }
  setTimeout(() => {
    list_roles.value = backup;
  }, 50);
};

const addDeleteRole = (Role) => {
  console.log(Role);
  let backup = list_roles.value;
  list_roles.value = [];
  let INDEX = backup.findIndex((rol) => rol.id == Role.id);
  if (INDEX != -1) {
    backup.splice(INDEX, 1);
  }
  setTimeout(() => {
    list_roles.value = backup;
  }, 50);
};

const editItem = (item) => {
  console.log(item);
  isRoleEditDialogVisible.value = true;
  role_selected_edit.value = item;
};
const deleteItem = (item) => {
  isRoleDeleteDialogVisible.value = true;
  role_selected_delete.value = item;
};

const getUniquePermissions = (permissions) => {
  if (!permissions) return [];
  return [...new Set(permissions)];
};

onMounted(() => {
  list();
});
definePage({ meta: { permission: "list_role" } });
</script>
<template>
  <div>
    <!-- <VCard title="🔏 Roles y Permisos">
      <VOverlay
        :model-value="isLoading"
        class="align-center justify-center"
        absolute
      >
        <VProgressCircular indeterminate size="50" width="5" color="primary" />
      </VOverlay>
      <VCardText>
        <VRow class="justify-space-between">
          <VCol cols="3">
            <VTextField
              placeholder="Search Role"
              density="compact"
              class="me-3"
              v-model="searchQuery"
              @keyup="list"
            />
          </VCol>
          <VCol cols="2" class="text-end">
            <VBtn @click="isRoleAddDialogVisible = !isRoleAddDialogVisible">
              Agregar Rol
              <VIcon end icon="ri-add-line" />
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
      <VDataTable
        :headers="headers"
        :items="list_roles"
        :items-per-page="10"
        class="text-no-wrap"
      >
        <template #item.id="{ item }">
          <span class="text-h6">{{ item.id }}</span>
        </template>
        <template #item.permissions_pluck="{ item }">
          <ul>
            <li
              v-for="(permission, index) in item.permissions_pluck"
              :key="index"
            >
              {{ permission }}
            </li>
          </ul>
        </template>

        <template #item.action="{ item }">
          <div class="d-flex gap-1">
            <IconBtn size="small" @click="editItem(item)">
              <VIcon icon="ri-pencil-line" />
            </IconBtn>
            <IconBtn size="small" @click="deleteItem(item)">
              <VIcon icon="ri-delete-bin-line" />
            </IconBtn>
          </div>
        </template>
      </VDataTable>
    </VCard> -->
    <VCard class="pa-2" title="🔏 Roles y Permisos">
      <!-- Overlay de carga -->
      <VOverlay
        :model-value="isLoading"
        class="align-center justify-center"
        absolute
      >
        <VProgressCircular indeterminate size="50" width="5" color="primary" />
      </VOverlay>

      <!-- Filtros -->
      <VCardText class="pb-0">
        <VRow class="align-center">
          <!-- Buscador -->
          <VCol cols="4" md="3">
            <VTextField
              v-model="searchQuery"
              placeholder="Buscar rol..."
              density="compact"
              variant="outlined"
              prepend-inner-icon="ri-search-line"
              @keyup="list"
            />
          </VCol>

          <!-- Botón agregar -->
          <VCol cols="6" md="2" class="text-end ms-auto">
            <VBtn
              color="primary"
              @click="isRoleAddDialogVisible = !isRoleAddDialogVisible"
            >
              Agregar Rol
              <VIcon end icon="ri-add-line" />
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>

      <!-- Tabla -->
      <VDataTable
        :headers="headers"
        :items="list_roles"
        :items-per-page="10"
        class="text-no-wrap"
      >
        <!-- ID bold -->
        <template #item.id="{ item }">
          <span class="font-weight-bold text-primary text-h6">
            {{ item.id }}
          </span>
        </template>

        <!-- Permisos como chips -->
        <template #item.permissions_pluck="{ item }">
          <div class="chips-container">
            <v-chip
              v-for="(permission, index) in getUniquePermissions(
                item.permissions_pluck,
              )"
              :key="index"
              :color="colors[index % colors.length]"
              class="ma-1"
              label
            >
              {{ permission }}
            </v-chip>
          </div>
        </template>

        <!-- Acciones -->
        <template #item.action="{ item }">
          <div class="d-flex ga-2">
            <IconBtn size="small" @click="editItem(item)">
              <VIcon icon="ri-pencil-line" />
            </IconBtn>

            <IconBtn size="small" @click="deleteItem(item)">
              <VIcon icon="ri-delete-bin-line" />
            </IconBtn>
          </div>
        </template>
      </VDataTable>
    </VCard>

    <RoleAddDialog
      v-model:isDialogVisible="isRoleAddDialogVisible"
      @addRole="addNewRole"
    ></RoleAddDialog>
    <RoleEditDialog
      v-if="role_selected_edit && isRoleEditDialogVisible"
      v-model:isDialogVisible="isRoleEditDialogVisible"
      :roleSelected="role_selected_edit"
      @editRole="addEditRole"
    ></RoleEditDialog>
    <RoleDeleteDialog
      v-if="role_selected_delete && isRoleDeleteDialogVisible"
      v-model:isDialogVisible="isRoleDeleteDialogVisible"
      :roleSelected="role_selected_delete"
      @deleteRole="addDeleteRole"
    ></RoleDeleteDialog>
  </div>
</template>
<style>
.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-height: 80px; /* evita que crezca infinito */
  overflow-y: auto; /* scroll solo interno */
  padding-right: 4px;
}
.date-col {
  max-width: 120px; /* Ajusta este ⚡ */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
