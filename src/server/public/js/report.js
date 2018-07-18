(function($){
	let reportCache = {};

	$(document).ready(() => {
				initReportPage();
	});

	function initReportPage() {
			const url = `${App.ROOT_URL}/reports/get-reports`;
			let reqObj = {type:'GET', url:url, dataType:'json'};
			let loaders = {};
			App.performAjaxRequest(reqObj, loaders, (result)=> {
					let reports = result.reports;
					console.log(result);
					if(reports){
							handlePopulateReport(reports);
					}
		});

		 $(document).on('click', '.csvdownload-btn', (event) => {
		     let $row = $(event.target).closest('tr');
		     let id = $row.find('.report-id').text();
				 let name = $row.find('.report-name').text();
				 console.log(id);
				 console.log(name);
				 handleDownload(id, name);
	   });
	}

	function handlePopulateReport(result) {
      result.forEach((report) => {
					addReportEntryFor(report);
				});
	}


	function addReportEntryFor(report) {
			let $row = $('<tr></tr>').html(`<td class="hidden report-id">${report.id}</>
																			<td class="report-name">${report.name}</td>
																			<td class='report-caption'>${report.caption}</td>
																			<td><button class="csvdownload-btn btn btn-default"><i class="fas fa-download"></i></button></td>`
																			).addClass('report-entry');
			let $tablebody = $('.report-table-body');
			$tablebody.append($row);
	}


	function handleDownload(filter, name){
		const url = `${App.ROOT_URL}/reports/${filter}`;
		$.get(url)
		 .done((result) => {
			 	downloadCSV(result, name);
		 })
		 .fail(() => {

		 });
	}


	function downloadCSV(report_data, name) {
        let data, filename, link;
        let csv = report_data.data;
        if(csv == null) return;

        filename = `${name}.csv`;
        csv = 'data:text/csv;charset=utf-8,' + csv;
				file = encodeURI(csv);
				link = document.createElement('a');
        link.setAttribute('href', file);
        link.setAttribute('download', filename);
        link.click();
    }



	function convertToCsv(args) {
				let result, ctr, keys, columnDelimiter, lineDelimeter;
				data = args.data || null;
				if(data == null || data.length < 1) {
					return null;
				}

				columnDelimiter = args.columnDelimiter || ',';
				lineDelimeter = args.lineDelimeter || '\n';

				keys = Object.keys(data[0]);

				result = '';
				result += keys.join(columnDelimiter);
				result += lineDelimeter;

				data.forEach((item)=> {
					ctr = 0;
					keys.forEach(((key)=> {
						if(ctr > 0) {
							result += columnDelimiter;
						}

						result += item[key];
						ctr++;
					}));
					result += lineDelimeter;
				});

				return result;
	}

})(jQuery)
