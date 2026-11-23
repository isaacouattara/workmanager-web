/**
 * Catalogue d'icônes : on utilise HUGEICONS (pack gratuit `@hugeicons/core-free-icons`).
 *
 * Pourquoi un fichier d'indirection ?
 *  - Les pages parlent en noms métier : <app-icon name="search" />
 *  - Seul CE fichier connaît les noms réels du pack. Changer d'icône = modifier une ligne ici.
 *  - Si un import est inconnu à la compilation, c'est ici (et seulement ici) qu'on le corrige :
 *    cherchez le nom sur https://hugeicons.com/icons (pack gratuit).
 */
import {
  Add01Icon, Airplane01Icon, Alert02Icon, ArrowDown01Icon, ArrowLeft01Icon, ArrowRight01Icon,
  ArrowUpDownIcon, Briefcase01Icon, Building03Icon, Calendar03Icon, Cancel01Icon, CancelCircleIcon,
  CheckmarkBadge01Icon, CheckmarkCircle02Icon, Clock01Icon, Comment01Icon, DashboardSquare01Icon,
  Delete02Icon, Download01Icon, FilterIcon, Flag02Icon, FlashIcon, Folder01Icon, GridViewIcon,
  InformationCircleIcon, Layers01Icon, Link01Icon, ListViewIcon, LockPasswordIcon, Logout01Icon,
  Mail01Icon, Menu01Icon, MoreHorizontalIcon, MoreVerticalIcon, Moon02Icon, Notification01Icon,
  PencilEdit02Icon, Search01Icon, Settings01Icon, SidebarLeftIcon, Sun03Icon, Table01Icon,
  Target01Icon, Tick02Icon, UnfoldMoreIcon, Upload01Icon, UserGroupIcon, UserIcon, ViewIcon, ViewOffIcon,
} from '@hugeicons/core-free-icons';

export const ICONS = {
  dashboard: DashboardSquare01Icon,
  users: UserGroupIcon,
  user: UserIcon,
  settings: Settings01Icon,
  bell: Notification01Icon,
  search: Search01Icon,
  chevronDown: ArrowDown01Icon,
  chevronRight: ArrowRight01Icon,
  chevronLeft: ArrowLeft01Icon,
  chevronsUpDown: UnfoldMoreIcon,
  panelLeft: SidebarLeftIcon,
  mail: Mail01Icon,
  lock: LockPasswordIcon,
  eye: ViewIcon,
  eyeOff: ViewOffIcon,
  check: Tick02Icon,
  checkCircle: CheckmarkCircle02Icon,
  cancelCircle: CancelCircleIcon,
  verified: CheckmarkBadge01Icon,
  alert: Alert02Icon,
  info: InformationCircleIcon,
  vacation: Airplane01Icon,
  clock: Clock01Icon,
  target: Target01Icon,
  flag: Flag02Icon,
  link: Link01Icon,
  calendar: Calendar03Icon,
  message: Comment01Icon,
  filter: FilterIcon,
  sort: ArrowUpDownIcon,
  zap: FlashIcon,
  more: MoreHorizontalIcon,
  moreVertical: MoreVerticalIcon,
  plus: Add01Icon,
  kanban: GridViewIcon,
  list: ListViewIcon,
  table: Table01Icon,
  layers: Layers01Icon,
  folder: Folder01Icon,
  briefcase: Briefcase01Icon,
  building: Building03Icon,
  sun: Sun03Icon,
  moon: Moon02Icon,
  menu: Menu01Icon,
  x: Cancel01Icon,
  logout: Logout01Icon,
  download: Download01Icon,
  upload: Upload01Icon,
  trash: Delete02Icon,
  edit: PencilEdit02Icon,
} as const;

/** Union des noms disponibles (autocomplétion partout). */
export type IconName = keyof typeof ICONS;
