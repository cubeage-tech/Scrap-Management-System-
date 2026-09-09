// Generic, reusable data table built on Material React Table.
//
// This component knows NOTHING about any specific domain (scrap lots,
// industries, buyers, etc). It only understands:
//   - columns / data (or a fetchData function for server-side data)
//   - loading / error state
//   - onView / onEdit / onDelete callbacks
//   - a handful of generic display options (title, mobileHiddenColumns...)
//
// All business logic (what View/Edit/Delete actually do, what the columns
// mean, what the status values are) lives in the page + its table config.
//
// Usage:
//   <MaterialTable config={industryTableConfig} data={filteredStock} />
//   <MaterialTable title="..." columns={cols} data={rows} onView={...} />

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ToggleFiltersButton,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFullScreenButton,
} from "material-react-table";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";

const MOBILE_BREAKPOINT = "(max-width:768px)";

const DEFAULT_PAGE_SIZE = 10;
const EMPTY_ARRAY = [];

const RowActionsMenu = ({ row, onView, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  if (!onView && !onEdit && !onDelete) return null;

  const close = () => setAnchorEl(null);

  const run = (callback) => {
    close();
    callback?.(row.original);
  };

  return (
    <>
      <Tooltip title="Actions">
        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} aria-label="Row actions">
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={open} onClose={close}>
        {onView && (
          <MenuItem onClick={() => run(onView)}>
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View</ListItemText>
          </MenuItem>
        )}

        {onEdit && (
          <MenuItem onClick={() => run(onEdit)}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}

        {onDelete && (
          <MenuItem onClick={() => run(onDelete)} sx={{ color: "error.main" }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

const MaterialTable = ({
  config = {},

  // Direct-prop overrides (take precedence over `config` when provided).
  title,
  columns,
  data: dataProp,
  loading,

  onView,
  onEdit,
  onDelete,

  fetchData,
  deleteData,

  mobileHiddenColumns,
  getRowId,

  // Row selection (opt-in, controlled). Pass `enableRowSelection` plus
  // `rowSelection`/`onRowSelectionChange` to read/drive selection from the
  // parent page (e.g. for a bulk-actions bar). Falls back to MRT's own
  // internal (uncontrolled) selection state if the parent doesn't need to
  // observe it.
  enableRowSelection,
  rowSelection,
  onRowSelectionChange,

  ...rest
}) => {
  const resolvedTitle = title ?? config.title;
  const resolvedColumns = useMemo(() => columns ?? config.columns ?? [], [columns, config.columns]);
  const resolvedFetchData = fetchData ?? config.fetchData;
  const resolvedDeleteData = deleteData ?? config.deleteData;
  const resolvedOnView = onView ?? config.onView;
  const resolvedOnEdit = onEdit ?? config.onEdit;
  const resolvedOnDelete = onDelete ?? config.onDelete;
  const resolvedMobileHiddenColumns =
    mobileHiddenColumns ?? config.mobileHiddenColumns ?? EMPTY_ARRAY;
  const resolvedGetRowId = getRowId ?? config.getRowId;

  const isServerSide = typeof resolvedFetchData === "function";

  // ---- server-side data state -------------------------------------------
  // Only populated/used in server-side mode. Client-side mode reads
  // `dataProp` directly below — no need to mirror it into state.
  const [serverRows, setServerRows] = useState([]);
  const [serverRowCount, setServerRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(isServerSide);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE });
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [internalRowSelection, setInternalRowSelection] = useState({});

  const resolvedRowSelection = rowSelection ?? internalRowSelection;
  const resolvedOnRowSelectionChange = onRowSelectionChange ?? setInternalRowSelection;

  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);

  // Force-hide configured columns on mobile by merging them into whatever
  // the user has already chosen via the column-visibility toggle, computed
  // at render time rather than written back into state.
  const effectiveColumnVisibility = useMemo(() => {
    if (!isMobile || resolvedMobileHiddenColumns.length === 0) return columnVisibility;
    const merged = { ...columnVisibility };
    resolvedMobileHiddenColumns.forEach((key) => {
      if (merged[key] === undefined) merged[key] = false;
    });
    return merged;
  }, [columnVisibility, isMobile, resolvedMobileHiddenColumns]);

  const rows = isServerSide ? serverRows : dataProp ?? [];
  const rowCount = isServerSide ? serverRowCount : rows.length;

  const loadServerData = useCallback(async () => {
    const params = {
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      search: globalFilter ?? "",
      sorting: sorting.map((s) => ({ id: s.id, desc: s.desc })),
      filters: columnFilters,
    };

    const response = await resolvedFetchData(params);
    return response;
  }, [resolvedFetchData, pagination, sorting, globalFilter, columnFilters]);

  // Bumped to force a refetch on demand (manual refresh, post-delete)
  // without duplicating the fetch/setState logic outside the effect below.
  const [refetchToken, setRefetchToken] = useState(0);

  // Fetch server-side data whenever pagination/sorting/filters/refetchToken
  // change. Follows React's documented data-fetching effect shape
  // (react.dev/learn/synchronizing-with-effects#fetching-data): the request
  // is kicked off from the effect, and an `ignore` flag guards against a
  // stale response overwriting a newer one if the deps change again before
  // it resolves.
  useEffect(() => {
    if (!isServerSide) return;

    let ignore = false;

    // Defer even the "fetch started" flags into a microtask callback rather
    // than setting them synchronously in the effect body, so every state
    // update here happens inside a callback (per React's documented
    // fetch-effect shape) instead of the effect's own function body.
    Promise.resolve()
      .then(() => {
        if (ignore) return;
        setIsFetching(true);
        setIsError(false);
        setError(null);
      })
      .then(loadServerData)
      .then((response) => {
        if (ignore) return;
        setServerRows(response?.data ?? []);
        setServerRowCount(response?.total ?? 0);
      })
      .catch((err) => {
        if (ignore) return;
        setIsError(true);
        setError(err);
      })
      .finally(() => {
        if (ignore) return;
        setIsLoading(false);
        setIsFetching(false);
      });

    return () => {
      ignore = true;
    };
  }, [isServerSide, loadServerData, refetchToken]);

  const handleRefresh = () => {
    if (isServerSide) {
      setRefetchToken((t) => t + 1);
    } else {
      config.onRefresh?.();
    }
  };

  // ---- delete confirmation -------------------------------------------
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleDeleteRequest = (row) => setDeleteTarget(row);
  const closeDeleteDialog = () => (!isDeleting ? setDeleteTarget(null) : null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      if (resolvedDeleteData) {
        await resolvedDeleteData(deleteTarget.id ?? deleteTarget._id);
      }
      resolvedOnDelete?.(deleteTarget);

      setSnackbar({ open: true, message: "Deleted successfully.", severity: "success" });
      setDeleteTarget(null);

      if (isServerSide) setRefetchToken((t) => t + 1);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.message || "Failed to delete. Please try again.",
        severity: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // ---- table instance -----------------------------------------------
  const table = useMaterialReactTable({
    columns: resolvedColumns,
    data: rows,
    getRowId: resolvedGetRowId ?? ((row) => row.id ?? row._id),

    state: {
      isLoading: loading ?? isLoading,
      showProgressBars: isFetching,
      showAlertBanner: isError,
      pagination,
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility: effectiveColumnVisibility,
      rowSelection: resolvedRowSelection,
    },

    manualPagination: isServerSide,
    manualSorting: isServerSide,
    manualFiltering: isServerSide,
    rowCount: isServerSide ? rowCount : undefined,

    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: Boolean(enableRowSelection),
    onRowSelectionChange: resolvedOnRowSelectionChange,

    muiToolbarAlertBannerProps: isError
      ? { color: "error", children: error?.message || "Something went wrong while loading data." }
      : undefined,

    enableSorting: true,
    enableColumnFilters: true,
    enableGlobalFilter: true,
    enableColumnResizing: true,
    enableColumnOrdering: true,
    enableHiding: true,
    enableStickyHeader: true,
    enableDensityToggle: true,
    enableFullScreenToggle: true,
    enablePagination: true,

    enableRowActions: Boolean(resolvedOnView || resolvedOnEdit || resolvedOnDelete),
    positionActionsColumn: "last",
    renderRowActions: ({ row }) => (
      <RowActionsMenu
        row={row}
        onView={resolvedOnView}
        onEdit={resolvedOnEdit}
        onDelete={resolvedOnDelete ? handleDeleteRequest : undefined}
      />
    ),

    renderTopToolbarCustomActions: resolvedTitle
      ? () => (
          <Typography variant="h6" fontWeight={700}>
            {resolvedTitle}
          </Typography>
        )
      : undefined,

    renderToolbarInternalActions: ({ table: tableInstance }) => (
      <>
        <Tooltip title="Refresh">
          <IconButton onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <MRT_ToggleFiltersButton table={tableInstance} />
        <MRT_ShowHideColumnsButton table={tableInstance} />
        <MRT_ToggleDensePaddingButton table={tableInstance} />
        <MRT_ToggleFullScreenButton table={tableInstance} />
      </>
    ),

    muiTableContainerProps: { sx: { maxHeight: "70vh", overflowX: "auto" } },

    muiTablePaperProps: { sx: { boxShadow: "none", border: "1px solid var(--color-border)" } },

    renderEmptyRowsFallback: () => (
      <div className="flex items-center justify-center py-12 text-sm text-slate-400">
        No records found.
      </div>
    ),

    ...rest,
  });

  return (
    <>
      <MaterialReactTable table={table} />

      <Dialog open={Boolean(deleteTarget)} onClose={closeDeleteDialog}>
        <DialogTitle>Delete record?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this record? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MaterialTable;
