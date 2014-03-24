module ApplicationHelper
  def generate_modal id, content, title
    "
    <div class=\"modal fade\" id=\"#{id}\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"#{id}-label\" aria-hidden=\"true\">
      <div class=\"modal-dialog\">
        <div class=\"modal-content\">
          <div class=\"modal-header\">
            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>
            <h4 class=\"modal-title\" id=\"#{id}-label\">#{title}</h4>
          </div>
          <div class=\"modal-body\">
            #{content}
          </div>
          <div class=\"modal-footer\">
            <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Close</button>
          </div>
        </div>
      </div>
    </div>
    "
  end
end
