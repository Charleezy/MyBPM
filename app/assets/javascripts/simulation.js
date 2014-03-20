$(document).ready(function() {
	$('#create_simulation').on('hidden.bs.modal', function () {
		$('#simName').parent('div').removeClass('has-error');
		$('#simname_err').hide();
		$('#simName').val("");
	});
		
	$('#simName').focus(function () {
		if ($('#simName').parent('div').hasClass('has-error')) {
			$('#simName').parent('div').removeClass('has-error');
			$('#simname_err').hide();
		}
	});
	
	$("#save").click(function() {
		var sim_name = $('#simName').val();
		var workflow_id = $('#workflow').find(":selected").val();
		if (sim_name == "" || sim_name == null)
		{
			$('#simName').parent('div').addClass('has-error');
			$('#simname_err').show();
		}
		else
		{
			$.ajax({
				beforeSend: function(req) {
					req.setRequestHeader("Accept", "application/json");
				},
				url: "simulation", 
				type: "POST",
				data: {mockdata : { "name" : sim_name, "workflow_id" : workflow_id}},
				success: function(sim_id) {
					/*console.log("Simulation " + sim_id + " successfully created.");*/
					location.reload();
				}
			});
		}
	});
		
	$(".edit").click(function() {
		var sim_id= $(this).parent('td').parent('tr').find('.sim_id').data('id');
		
		$.ajax({
			beforeSend: function(req) {
				req.setRequestHeader("Accept", "application/json");
			},
			url: "simulation/" + sim_id, 
			type: "DELETE",
			success: function(sim_id) {
				location.reload();
			}
		});
	});
		
	$(".delete").click(function() {
		var sim_id= $(this).parent('td').parent('tr').find('.sim_id').data('id');
		
		$.ajax({
			beforeSend: function(req) {
				req.setRequestHeader("Accept", "application/json");
			},
			url: "simulation/" + sim_id, 
			type: "DELETE",
			success: function(sim_id) {
				/*console.log("Simulation " + sim_id + " successfully deleted.");*/
				location.reload();
			}
		});
	});
});