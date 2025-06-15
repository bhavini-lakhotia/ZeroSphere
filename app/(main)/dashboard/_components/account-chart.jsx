return (
  <Card className="bg-muted/40 dark:bg-zinc-900 rounded-2xl shadow-md border border-muted transition-colors duration-300">
    <CardHeader className="flex flex-row items-center justify-between p-6 pb-7">
      <CardTitle className="text-base font-normal text-foreground">
        Transaction Overview
      </CardTitle>
      <Select defaultValue={dateRange} onValueChange={setDateRange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(DATE_RANGES).map(([key, { label }]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </CardHeader>

    <CardContent className="p-6">
      <div className="flex justify-around mb-6 text-sm">
        <div className="text-center">
          <p className="text-muted-foreground">Total Income</p>
          <p className="text-lg font-bold text-emerald-500 dark:text-emerald-400">
            ₹{totals.income.toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground">Total Expenses</p>
          <p className="text-lg font-bold text-rose-500 dark:text-rose-400">
            ₹{totals.expense.toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground">Net</p>
          <p
            className={`text-lg font-bold ${
              totals.income - totals.expense >= 0
                ? "text-emerald-500 dark:text-emerald-400"
                : "text-rose-500 dark:text-rose-400"
            }`}
          >
            ₹{(totals.income - totals.expense).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="h-[300px] transition-all duration-500">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
            <XAxis
              dataKey="date"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value}`}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip
              formatter={(value) => [`₹${value}`, undefined]}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend
              wrapperStyle={{
                color: "hsl(var(--foreground))",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            />
            <Bar
              dataKey="income"
              name="Income"
              fill="#10b981" // emerald-500
              radius={[4, 4, 0, 0]}
              isAnimationActive
            />
            <Bar
              dataKey="expense"
              name="Expense"
              fill="#ef4444" // rose-500
              radius={[4, 4, 0, 0]}
              isAnimationActive
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);
