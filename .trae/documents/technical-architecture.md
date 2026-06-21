## 1. 架构设计

```mermaid
graph TD
    A["浏览器层<br/>React SPA"] --> B["状态管理层<br/>React useState/useEffect"]
    B --> C["组件层"]
    C --> C1["顶部状态栏 Header"]
    C --> C2["线路总览 RouteOverview"]
    C --> C3["异常学生异常学生 AbnormalStudents"]
    C --> C4["班次归档 ShiftArchive"]
    D["Mock 数据层<br/>data/mockData.ts"] --> B
    E["样式层<br/>Tailwind CSS + 自定义样式"] --> C
```

## 2. 技术描述

- **前端框架**：React@18 + TypeScript
- **构建工具**：Vite@5
- **样式方案**：Tailwind CSS@3 + CSS Variables
- **图标库**：Lucide React
- **字体**：Noto Sans SC（Google Fonts）+ JetBrains Mono
- **后端**：无（纯前端 Mock 数据）
- **数据库**：无（本地 Mock 数据）

### 项目结构

```
src/
├── components/
│   ├── Header.tsx           # 顶部状态栏
│   ├── RouteOverview.tsx    # 线路总览模块
│   ├── RouteCard.tsx        # 单条线路卡片
│   ├── AbnormalStudents.tsx # 异常学生模块
│   ├── StudentItem.tsx      # 单个学生条目
│   └── ShiftArchive.tsx     # 班次归档模块
├── data/
│   └── mockData.ts          # Mock 数据定义
├── types/
│   └── index.ts             # TypeScript 类型定义
├── App.tsx                  # 主应用组件
├── main.tsx                 # 入口文件
└── index.css                # 全局样式 + Tailwind
```

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| / | 调度看板首页（单页应用，唯一主页面） |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    ROUTE {
        string id "线路ID"
        string name "线路名称"
        string routeNumber "线路编号"
        string driver "司机姓名"
        string caretaker "照管员姓名"
        number expectedCount "应乘人数"
        number boardedCount "已上车人数"
        number unconfirmedCount "未确认人数"
        string status "状态: normal/delayed/abnormal"
        string lastUpdate "最后更新时间"
        string currentLocation "当前位置"
    }

    STUDENT {
        string id "学生ID"
        string name "学生姓名"
        string className "班级"
        string station "站点"
        string routeId "所属线路ID"
        string abnormalType "异常类型: absent/wrong_station/parent_pickup"
        string caretakerNote "照管员备注"
        string contactPerson "建议联系对象"
        string contactPhone "联系电话"
        number priority "优先级: 1紧急/2一般"
        string reportTime "上报时间"
    }

    SHIFT {
        string id "班次ID"
        string date "日期"
        string shiftType "班次类型: 早班/晚班"
        string routeId "线路ID"
        string driver "司机"
        string caretaker "照管员"
        boolean alightingCheck "下车点名完成"
        boolean cabinCheck "车厢清查完成"
        number studentCount "乘车学生数"
        number abnormalCount "异常数"
        string completedTime "完成时间"
    }
```

### 4.2 TypeScript 类型定义

```typescript
type RouteStatus = 'normal' | 'delayed' | 'abnormal';
type AbnormalType = 'absent' | 'wrong_station' | 'parent_pickup';
type ShiftType = 'morning' | 'afternoon';

interface Route {
  id: string;
  name: string;
  routeNumber: string;
  driver: string;
  caretaker: string;
  expectedCount: number;
  boardedCount: number;
  unconfirmedCount: number;
  status: RouteStatus;
  lastUpdate: string;
  currentLocation: string;
}

interface Student {
  id: string;
  name: string;
  className: string;
  station: string;
  routeId: string;
  abnormalType: AbnormalType;
  caretakerNote: string;
  contactPerson: string;
  contactPhone: string;
  priority: 1 | 2;
  reportTime: string;
}

interface Shift {
  id: string;
  date: string;
  shiftType: ShiftType;
  routeId: string;
  driver: string;
  caretaker: string;
  alightingCheck: boolean;
  cabinCheck: boolean;
  studentCount: number;
  abnormalCount: number;
  completedTime: string;
}

interface DashboardStats {
  totalRoutes: number;
  runningRoutes: number;
  completedRoutes: number;
  abnormalCount: number;
  currentTime: string;
  dutyOfficer: string;
}
```

## 5. 核心交互逻辑

### 5.1 实时数据更新
- 使用 `useEffect` + `setInterval` 每 10 秒模拟数据更新
- 随机调整各线路的 `boardedCount` 和 `unconfirmedCount`
- 偶尔触发新的异常学生上报

### 5.2 状态颜色映射
- `normal` → 绿色 `#10B981`
- `delayed` → 橙色 `#F59E0B`
- `abnormal` → 红色 `#EF4444`

### 5.3 异常类型文本映射
- `absent` → 未到
- `wrong_station` → 错站
- `parent_pickup` → 家长接走
