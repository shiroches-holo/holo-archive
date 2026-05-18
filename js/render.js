function render(){
  const tbody = document.querySelector("#list tbody");
  tbody.innerHTML = ""; // ←これも必要！

  const playlistCheckboxes = document.querySelectorAll("#playlistFilterArea input");

  if(playlistCheckboxes.length === 0){
    return; // まだロード中なので描画しない
  }
  
  const keyword = document.getElementById("search").value.toLowerCase();
  const status = document.getElementById("filterStatus").value;
  const sort = document.getElementById("sort").value;

  let filtered = data.filter(item => {

    // タイトル
    if(keyword && !item.title.toLowerCase().includes(keyword)) return false;

    // 再生リスト
    const checkedPlaylists = Array.from(
      document.querySelectorAll("#playlistFilterArea input:checked")
    ).map(cb => cb.value);

    if(checkedPlaylists.length === 0) return false
    
    if(!checkedPlaylists.includes(item.playlistName)) return false;
    

    // 視聴状態
    const watched = localStorage.getItem(item.videoId) === "true";
    if(status === "watched" && !watched) return false;
    if(status === "unwatched" && watched) return false;

    // 日付
    const from = document.getElementById("dateFrom").value;
    const to = document.getElementById("dateTo").value;
    const itemDate = new Date(item.publishedAt);

    if(from && itemDate < new Date(from)) return false;
    if(to && itemDate > new Date(to)) return false;

    // 時間フィルタ(ドロップダウン)
    const limit = document.getElementById("durationLimit").value;
    if(limit){
      const minutes = item.durationSec / 60;
      if(minutes > Number(limit)) return false;
    }

    return true;
  });

  // ソート
  if(sort==="new") filtered.sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt));
  if(sort==="old") filtered.sort((a,b)=>new Date(a.publishedAt)-new Date(b.publishedAt));
  if(sort==="title_asc") filtered.sort((a,b)=>a.title.localeCompare(b.title));
  if(sort==="title_desc") filtered.sort((a,b)=>b.title.localeCompare(a.title));
  if(sort==="long") filtered.sort((a,b)=>b.durationSec-a.durationSec);
  if(sort==="short") filtered.sort((a,b)=>a.durationSec-b.durationSec);
 
  // 描画
  const viewMode = getViewMode();
  
  const thead = document.querySelector("#list thead");
  thead.style.display = (viewMode === "card") ? "none" : "";

  filtered.forEach(item=>{
    const tr = document.createElement("tr");
    tr.dataset.id = item.videoId;
  
    const checked = localStorage.getItem(item.videoId)==="true";
  
    if(viewMode === "card"){
  
      tr.innerHTML = `
        <td colspan="5">
          <div class="card">

            <!-- サムネ -->
            <div class="thumb">
                <img src="https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg">
            </div>
            
            <div class="card-content">

            <div class="title">
              <a href="https://www.youtube.com/watch?v=${item.videoId}" target="_blank">
                ${item.title}
              </a>
            </div>
  
            <div>📅 ${formatDate(item.publishedAt)}</div>
            <div>⏱ ${formatDuration(item.durationSec)}</div>
  
            <div>
              <!-- 視聴済み <input type="checkbox" ${checked?"checked":""}> -->
            </div>
  
            <div>
            🎵 ${
              item.playlistUrl
                ? `<a href="${item.playlistUrl}" target="_blank">${item.playlistName}</a>`
                : item.playlistName
            }
            </div>
  
            <!-- 視聴済み✅ -->
            <div class="check-area">
              視聴済み <input type="checkbox" ${checked?"checked":""}>
            </div>

          </div>
        </td>
      `;
  
    } else {
  
      tr.innerHTML = `
        <td>${formatDate(item.publishedAt)}</td>
        <td>
          <a href="https://www.youtube.com/watch?v=${item.videoId}" target="_blank">
            ${item.title}
          </a>
        </td>
        <td class="time-cell">${formatDuration(item.durationSec)}</td>
        <td class="check-cell">
          <input type="checkbox" ${checked?"checked":""}>
        </td>
        <td>
          ${
            item.playlistUrl
              ? `<a href="${item.playlistUrl}" target="_blank">${item.playlistName}</a>`
              : item.playlistName
          }
        </td>
      `;
    }
  
    if(checked) tr.style.background="#e6ffe6";
  
    const cb = tr.querySelector("input");
    cb.addEventListener("change", ()=>{
      localStorage.setItem(item.videoId, cb.checked);
      render();
    });
  
    tbody.appendChild(tr);
  });
  
  updateStats(filtered);
  updatePlaylistCount();

}

