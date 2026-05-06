    const gradePoints = {
      'A': 4.0, 'AB': 3.5, 'B': 3.0, 'BC': 2.5, 'C': 2.0, 
      'CD': 1.5, 'D': 1.0, 'E': 0.5, 'F': 0
    };

    let Student_result = []; // Will load from JSON

    // Load results from external JSON file
    async function loadResults() {
      const container = document.getElementById('pest-container');
      try {
        container.innerHTML = '<p class="loading">Loading results...</p>';
        const response = await fetch('results.json');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        Student_result = await response.json();
        container.innerHTML = '';
      } catch (error) {
        console.error('Failed to load results.json:', error);
        container.innerHTML = '<p class="not-found">Error loading results.</p>';
      }
    }

    function calculateSemester(courses) {
      let totalPoints = 0;
      let totalUnits = 0;
      let carryOvers = 0;

      courses.forEach(course => {
        const points = gradePoints[course.grade] || 0;
        totalPoints += points * course.unit;
        totalUnits += course.unit;
        if (course.grade === 'F') carryOvers++;
      });

      const gpa = totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : 0.00;
      return { gpa, totalUnits, totalPoints, carryOvers };
    }

    function calculateAllSemesters(semesters) {
      let cumulativePoints = 0;
      let cumulativeUnits = 0;
      let totalCarryOvers = 0;
      let semesterResults = [];

      semesters.forEach(sem => {
        const calc = calculateSemester(sem.Courses);
        cumulativePoints += calc.totalPoints;
        cumulativeUnits += calc.totalUnits;
        totalCarryOvers += calc.carryOvers;
        
        semesterResults.push({
          name: sem.name,
          courses: sem.Courses,
          gpa: calc.gpa,
          units: calc.totalUnits
        });
      });

      const cgpa = cumulativeUnits > 0 ? (cumulativePoints / cumulativeUnits).toFixed(2) : 0.00;
      
      return {
        semesterResults,
        cgpa,
        totalUnits: cumulativeUnits,
        totalCarryOvers
      };
    }

    function displayStudent(student) {
      const container = document.getElementById('pest-container');
      container.innerHTML = '';

      if (student) {
        const results = calculateAllSemesters(student.Semesters);
        
        let semesterTables = '';
        results.semesterResults.forEach(sem => {
          let tableRows = '';
          sem.courses.forEach(course => {
            const isCarryOver = course.grade === 'F';
            tableRows += `
              <tr class="${isCarryOver ? 'carry-over' : ''}">
                <td>${course.code}</td>
                <td>${course.title}</td>
                <td>${course.unit}</td>
                <td>${course.grade}</td>
                <td>${(gradePoints[course.grade] * course.unit).toFixed(1)}</td>
              </tr>
            `;
          });

          semesterTables += `
            <div class="semester-title">${sem.name} - GPA: ${sem.gpa} | Units: ${sem.units}</div>
            <table class="result-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Title</th>
                  <th>Unit</th>
                  <th>Grade</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>${tableRows}</tbody>
            </table>
          `;
        });

        const div = document.createElement('div');
        div.classList.add('result-card');
        div.innerHTML = `
          <div class="student-info">
            <h3>${student.student_name}</h3>
            <p><strong>Matric No:</strong> ${student.Matrick_No}</p>
            <p><strong>Department:</strong> ${student.Department}</p>
            <p><strong>Level:</strong> ${student.Level}</p>
          </div>

          ${semesterTables}

          <div class="summary-box">
            <div class="summary-item">
              <h4>Final CGPA</h4>
              <p>${results.cgpa}</p>
            </div>
            <div class="summary-item">
              <h4>Total Units</h4>
              <p>${results.totalUnits}</p>
            </div>
            <div class="summary-item">
              <h4>Total Carry Overs</h4>
              <p>${results.totalCarryOvers}</p>
            </div>
          </div>

          <button class="print-btn" onclick="window.print()">Print Result</button>
        `;
        container.appendChild(div);
      }
    }

    document.getElementById('search').addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '');
      
      const value = this.value.trim();
      const container = document.getElementById('pest-container');
      
      if (value === '') {
        container.innerHTML = '';
        return;
      }

      // Make sure results are loaded first
      if (Student_result.length === 0) {
        container.innerHTML = '<p class="loading">Results not loaded yet. Please wait...</p>';
        return;
      }

      const found = Student_result.find(student => 
        student.Matrick_No === value
      );

      if (found) {
        displayStudent(found);
      } else {
        container.innerHTML = '<p class="not-found">No student found with Matric No: ' + value + '</p>';
      }
    });

    // Load results when page opens
    window.addEventListener('DOMContentLoaded', loadResults);
