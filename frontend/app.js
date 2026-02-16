(function () {
  const $ = (id) => document.getElementById(id);

  async function request(path, options = {}) {
    const base = $("apiBase").value.trim().replace(/\/$/, "");
    const response = await fetch(`${base}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(body || `HTTP ${response.status}`);
    }
    return response.json();
  }

  async function loadOverview() {
    const data = await request("/api/overview");
    $("clientsTotal").textContent = data.clients_total;
    $("tasksTotal").textContent = data.tasks_total;
    $("runningTasks").textContent = data.running_tasks;
  }

  async function loadLatestReport() {
    try {
      const report = await request("/api/reports/latest");
      $("reportOutput").textContent = JSON.stringify(report, null, 2);
    } catch (error) {
      $("reportOutput").textContent = `No report available yet: ${error.message}`;
    }
  }

  $("refreshBtn").addEventListener("click", async () => {
    try {
      await loadOverview();
      await loadLatestReport();
    } catch (error) {
      alert(`Refresh failed: ${error.message}`);
    }
  });

  $("runCycleBtn").addEventListener("click", async () => {
    try {
      const report = await request("/api/run-cycle", { method: "POST" });
      $("reportOutput").textContent = JSON.stringify(report, null, 2);
      await loadOverview();
    } catch (error) {
      alert(`Cycle failed: ${error.message}`);
    }
  });

  $("addClientBtn").addEventListener("click", async () => {
    const payload = {
      name: $("clientName").value.trim(),
      email: $("clientEmail").value.trim(),
      service: $("clientService").value.trim(),
    };
    try {
      await request("/api/clients", { method: "POST", body: JSON.stringify(payload) });
      $("clientName").value = "";
      $("clientEmail").value = "";
      $("clientService").value = "";
      await loadOverview();
      alert("Client created.");
    } catch (error) {
      alert(`Create client failed: ${error.message}`);
    }
  });

  $("addTaskBtn").addEventListener("click", async () => {
    const payload = {
      title: $("taskTitle").value.trim(),
      agent: $("taskAgent").value.trim(),
    };
    try {
      await request("/api/tasks", { method: "POST", body: JSON.stringify(payload) });
      $("taskTitle").value = "";
      $("taskAgent").value = "";
      await loadOverview();
      alert("Task queued.");
    } catch (error) {
      alert(`Queue task failed: ${error.message}`);
    }
  });

  loadOverview().then(loadLatestReport).catch(() => {});
})();
