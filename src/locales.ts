export const translations = {
  en: {
    app: {
      title: "Find Optimal Investment Ratio",
      subtitle: "Maximize median growth based on Monte Carlo algorithm",
      errorTitle: "Simulation Error",
      errorGeneric: "An unexpected error occurred.",
      processing: "Processing...",
      confirmBig: "This will run {count} different parameter combinations. It might freeze your browser. Continue?"
    },
    strategy: {
      title: "1. Market Model and Strategy Params",
      paramsTitle: "Strategy Parameters",
      paramsDesc: "Define variables to control your strategy (e.g., invest percentage).",
      addPlaceholder: "e.g. percent",
      noParams: "No parameters defined yet.",
      logicTitle: "JavaScript Market Model Func",
      logicDesc: "Returns invest result multiplier (e.g. 1.05 = +5%, 0.9 = -10%)",
      codePlaceholder: "// Write your strategy logic here... Use Math.random() to simulate market situations, and use param to calc invest result multiplier.\n// Example:\nconst outcome = Math.random();\nif (outcome > 0.5) return 1 + leverage;\nelse return 1 - leverage;",
      nextBtn: "Next: Configure Parameters"
    },
    config: {
      title: "2. Configuration",
      simSettings: "Simulation Settings",
      expPerParam: "Experiments per Param Set",
      expPerParamDesc: "Higher values increase median accuracy but slow down simulation.",
      rounds: "Rounds per Experiment",
      roundsDesc: "How many times the strategy is applied sequentially.",
      threads: "Thread Count",
      threadsDesc: "Parallel workers. Set to your CPU core count (e.g., 4-8) for speed.",
      paramTraversal: "Parameter Traversal",
      noParams: "No parameters defined in strategy.",
      headerParam: "Parameter",
      headerMin: "Min",
      headerMax: "Max",
      headerStride: "Stride (Step)",
      runBtn: "Run Simulation"
    },
    results: {
      title: "3. Simulation Results",
      optConfig: "Optimal Configuration",
      maxGrowth: "Max Median Growth Rate",
      perRound: "per round",
      chartTitle: "Growth Rate (%)",
      vizNA: "Visualization not available for >2 varying parameters.",
      fixParams: "Please fix some parameters or inspect the best result above.",
      surfaceTitle: "Growth Rate Surface (%)",
      growthAxis: "Growth (%)"
    }
  },
  zh: {
    app: {
      title: "寻找最优投资比例",
      subtitle: "基于蒙特卡洛算法，最大化中位数的增长",
      errorTitle: "模拟错误",
      errorGeneric: "发生了意外错误。",
      processing: "处理中...",
      confirmBig: "这将运行 {count} 种不同的参数组合，可能会导致浏览器卡顿。是否继续？"
    },
    strategy: {
      title: "1. 市场模型和策略参数",
      paramsTitle: "策略参数",
      paramsDesc: "定义控制策略的变量（例如：投入比例）。",
      addPlaceholder: "例如：percent",
      noParams: "暂未定义参数。",
      logicTitle: "JavaScript 市场模型函数",
      logicDesc: "返回投资结果倍数（例如 1.05 = +5%, 0.9 = -10%）",
      codePlaceholder: "// 在此编写策略逻辑... 使用Math.random()模拟市场的不同可能情景，并返回对应的投资倍率（初始资金为1）\n// 示例：\nconst outcome = Math.random();\nif (outcome > 0.5) return 1 + leverage;\nelse return 1 - leverage;",
      nextBtn: "下一步：配置参数"
    },
    config: {
      title: "2. 配置",
      simSettings: "模拟设置",
      expPerParam: "每组参数实验次数",
      expPerParamDesc: "数值越高，中位数越准确，但模拟速度变慢。",
      rounds: "单次实验轮数",
      roundsDesc: "策略连续执行的次数。",
      threads: "线程数量",
      threadsDesc: "并行工作线程。建议设置为 CPU 核心数（如 4-8）以提高速度。",
      paramTraversal: "参数遍历",
      noParams: "策略中未定义参数。",
      headerParam: "参数",
      headerMin: "最小值",
      headerMax: "最大值",
      headerStride: "步长",
      runBtn: "运行模拟"
    },
    results: {
      title: "3. 模拟结果",
      optConfig: "最佳配置",
      maxGrowth: "最大中位数增长率",
      perRound: "每轮",
      chartTitle: "增长率 (%)",
      vizNA: "参数超过2个时无法展示图表。",
      fixParams: "请固定部分参数或查看上方的最佳结果。",
      surfaceTitle: "增长率曲面 (%)",
      growthAxis: "增长 (%)"
    }
  }
};

export type Translation = typeof translations.en;