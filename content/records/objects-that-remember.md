+++
title = "缓存失效应当沿内容路径发生"
published = "2026-08-02"
summary = "内容更新不需要刷新整站；依赖关系应从被修改的文档向所属集合精确扩散。"
constellations = ["private-infrastructure", "ordinary-machines"]
+++

## 以路径作为依赖键

当文章目录被约定为稳定的数据源时，开发环境的更新也应遵循同一条路径。`records/rendering-budget.md` 变化，详情页依赖它，记录列表依赖 `records`，星群又依赖所有内容集。

```ts
invalidate(content_dependency(content_id))
invalidate(content_dependency(collection))
```

## 不要把重新加载当作同步策略

只要能表达真实依赖，局部失效就比“改动后全量刷新”更快，也更容易知道为什么页面改变了。集合页与星群页需要的额外依赖应显式声明，而不是依靠某个全局刷新开关侥幸保持一致。
