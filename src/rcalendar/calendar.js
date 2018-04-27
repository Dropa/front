angular.module("ui.rCalendar.tpls",["template/rcalendar/calendar.html","template/rcalendar/day.html","template/rcalendar/month.html","template/rcalendar/week.html"]),angular.module("ui.rCalendar",["ui.rCalendar.tpls"]).constant("calendarConfig",{formatDay:"dd",formatDayHeader:"EEE",formatDayTitle:"MMMM dd, yyyy",formatWeekTitle:"MMMM yyyy, Week w",formatMonthTitle:"MMMM yyyy",formatWeekViewDayHeader:"EEE d",formatHourColumn:"ha",calendarMode:"month",showWeeks:!1,showEventDetail:!0,startingDay:0,allDayLabel:"all day",noEventsLabel:"No Events",eventSource:null,queryMode:"local",step:60}).controller("ui.rCalendar.CalendarController",["$scope","$attrs","$parse","$interpolate","$log","dateFilter","calendarConfig",function($scope,$attrs,$parse,$interpolate,$log,dateFilter,calendarConfig){"use strict";function overlap(event1,event2){var earlyEvent=event1,lateEvent=event2;return(event1.startIndex>event2.startIndex||event1.startIndex===event2.startIndex&&event1.startOffset>event2.startOffset)&&(earlyEvent=event2,lateEvent=event1),!(earlyEvent.endIndex<=lateEvent.startIndex)&&!(earlyEvent.endIndex-lateEvent.startIndex==1&&earlyEvent.endOffset+lateEvent.startOffset>=self.hourParts)}function calculatePosition(events){var i,j,col,len=events.length,maxColumn=0,isForbidden=new Array(len);for(i=0;i<len;i+=1){for(col=0;col<maxColumn;col+=1)isForbidden[col]=!1;for(j=0;j<i;j+=1)overlap(events[i],events[j])&&(isForbidden[events[j].position]=!0);for(col=0;col<maxColumn&&isForbidden[col];col+=1);events[i].position=col<maxColumn?col:maxColumn++}}function calculateWidth(orderedEvents,hourParts){var event,index,i,j,len,eventCountInCell,currentEventInCell,totalSize=24*hourParts,cells=new Array(totalSize);for(orderedEvents.sort(function(eventA,eventB){return eventB.position-eventA.position}),i=0;i<totalSize;i+=1)cells[i]={calculated:!1,events:[]};for(len=orderedEvents.length,i=0;i<len;i+=1)for(event=orderedEvents[i],index=event.startIndex*hourParts+event.startOffset;index<event.endIndex*hourParts-event.endOffset;)cells[index].events.push(event),index+=1;for(i=0;i<len;){if(event=orderedEvents[i],!event.overlapNumber){var overlapNumber=event.position+1;event.overlapNumber=overlapNumber;for(var eventQueue=[event];event=eventQueue.shift();)for(index=event.startIndex*hourParts+event.startOffset;index<event.endIndex*hourParts-event.endOffset;){if(!cells[index].calculated&&(cells[index].calculated=!0,cells[index].events))for(eventCountInCell=cells[index].events.length,j=0;j<eventCountInCell;j+=1)currentEventInCell=cells[index].events[j],currentEventInCell.overlapNumber||(currentEventInCell.overlapNumber=overlapNumber,eventQueue.push(currentEventInCell));index+=1}}i+=1}}var self=this,ngModelCtrl={$setViewValue:angular.noop};if(angular.forEach(["formatDay","formatDayHeader","formatDayTitle","formatWeekTitle","formatMonthTitle","formatWeekViewDayHeader","formatHourColumn","allDayLabel","noEventsLabel"],function(key,index){self[key]=angular.isDefined($attrs[key])?$interpolate($attrs[key])($scope.$parent):calendarConfig[key]}),angular.forEach(["showWeeks","showEventDetail","startingDay","eventSource","queryMode","step"],function(key,index){self[key]=angular.isDefined($attrs[key])?$scope.$parent.$eval($attrs[key]):calendarConfig[key]}),self.hourParts=1,60!==self.step&&30!==self.step&&15!==self.step)throw new Error("Invalid step parameter: "+self.step);self.hourParts=Math.floor(60/self.step);var unregisterFn=$scope.$parent.$watch($attrs.eventSource,function(value){self.onEventSourceChanged(value)});$scope.$on("$destroy",unregisterFn),$scope.calendarMode=$scope.calendarMode||calendarConfig.calendarMode,angular.isDefined($attrs.initDate)&&(self.currentCalendarDate=$scope.$parent.$eval($attrs.initDate)),self.currentCalendarDate||(self.currentCalendarDate=new Date,$attrs.ngModel&&!$scope.$parent.$eval($attrs.ngModel)&&$parse($attrs.ngModel).assign($scope.$parent,self.currentCalendarDate)),self.init=function(ngModelCtrl_){ngModelCtrl=ngModelCtrl_,ngModelCtrl.$render=function(){self.render()}},self.render=function(){if(ngModelCtrl.$modelValue){var date=new Date(ngModelCtrl.$modelValue),isValid=!isNaN(date);isValid?this.currentCalendarDate=date:$log.error('"ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.'),ngModelCtrl.$setValidity("date",isValid)}this.refreshView()},self.refreshView=function(){this.mode&&(this.range=this._getRange(this.currentCalendarDate),this._refreshView(),this.rangeChanged())},self.split=function(arr,size){for(var arrays=[];arr.length>0;)arrays.push(arr.splice(0,size));return arrays},self.onEventSourceChanged=function(value){self.eventSource=value,self._onDataLoaded&&self._onDataLoaded()},$scope.move=function(direction){var firstDayInNextMonth,step=self.mode.step,currentCalendarDate=self.currentCalendarDate,year=currentCalendarDate.getFullYear()+direction*(step.years||0),month=currentCalendarDate.getMonth()+direction*(step.months||0),date=currentCalendarDate.getDate()+direction*(step.days||0);currentCalendarDate.setFullYear(year,month,date),"month"===$scope.calendarMode&&(firstDayInNextMonth=new Date(year,month+1,1),firstDayInNextMonth.getTime()<=currentCalendarDate.getTime()&&(self.currentCalendarDate=new Date(firstDayInNextMonth-864e5))),ngModelCtrl.$setViewValue(self.currentCalendarDate),self.refreshView()},self.move=function(direction){$scope.move(direction)},self.rangeChanged=function(){"local"===self.queryMode?self.eventSource&&self._onDataLoaded&&self._onDataLoaded():"remote"===self.queryMode&&$scope.rangeChanged&&$scope.rangeChanged({startTime:this.range.startTime,endTime:this.range.endTime})},self.placeEvents=function(orderedEvents){calculatePosition(orderedEvents),calculateWidth(orderedEvents,self.hourParts)},self.placeAllDayEvents=function(orderedEvents){calculatePosition(orderedEvents)}}]).directive("calendar",function(){"use strict";return{restrict:"EA",replace:!0,templateUrl:"template/rcalendar/calendar.html",scope:{calendarMode:"=",rangeChanged:"&",eventSelected:"&",timeSelected:"&"},require:["calendar","?^ngModel"],controller:"ui.rCalendar.CalendarController",link:function(scope,element,attrs,ctrls){var calendarCtrl=ctrls[0],ngModelCtrl=ctrls[1];ngModelCtrl&&calendarCtrl.init(ngModelCtrl),scope.$on("changeDate",function(event,direction){calendarCtrl.move(direction)}),scope.$on("eventSourceChanged",function(event,value){calendarCtrl.onEventSourceChanged(value)})}}}).directive("monthview",["dateFilter",function(dateFilter){"use strict";return{restrict:"EA",replace:!0,templateUrl:"template/rcalendar/month.html",require:["^calendar","?^ngModel"],link:function(scope,element,attrs,ctrls){function getDates(startDate,n){var dates=new Array(n),current=new Date(startDate),i=0;for(current.setHours(12);i<n;)dates[i++]=new Date(current),current.setDate(current.getDate()+1);return dates}function createDateObject(date,format){return{date:date,label:dateFilter(date,format),selected:0===ctrl.compare(date,ctrl.currentCalendarDate),current:0===ctrl.compare(date,new Date)}}function compareEvent(event1,event2){return event1.allDay?1:event2.allDay?-1:event1.startTime.getTime()-event2.startTime.getTime()}function getISO8601WeekNumber(date){var dayOfWeekOnFirst=new Date(date.getFullYear(),0,1).getDay(),firstThurs=new Date(date.getFullYear(),0,(dayOfWeekOnFirst<=4?5:12)-dayOfWeekOnFirst),thisThurs=new Date(date.getFullYear(),date.getMonth(),date.getDate()+(4-date.getDay())),diff=thisThurs-firstThurs;return 1+Math.round(diff/6048e5)}var ctrl=ctrls[0],ngModelCtrl=ctrls[1];scope.showWeeks=ctrl.showWeeks,scope.showEventDetail=ctrl.showEventDetail,scope.noEventsLabel=ctrl.noEventsLabel,scope.allDayLabel=ctrl.allDayLabel,ctrl.mode={step:{months:1}},scope.select=function(viewDate){var rows=scope.rows,selectedDate=viewDate.date,events=viewDate.events;if(rows){var currentCalendarDate=ctrl.currentCalendarDate,currentMonth=currentCalendarDate.getMonth(),currentYear=currentCalendarDate.getFullYear(),selectedMonth=selectedDate.getMonth(),selectedYear=selectedDate.getFullYear(),direction=0;if(currentYear===selectedYear?currentMonth!==selectedMonth&&(direction=currentMonth<selectedMonth?1:-1):direction=currentYear<selectedYear?1:-1,ctrl.currentCalendarDate=selectedDate,ngModelCtrl&&ngModelCtrl.$setViewValue(selectedDate),0===direction)for(var row=0;row<6;row+=1)for(var date=0;date<7;date+=1){var selected=0===ctrl.compare(selectedDate,rows[row][date].date);rows[row][date].selected=selected,selected&&(scope.selectedDate=rows[row][date])}else ctrl.refreshView();scope.timeSelected&&scope.timeSelected({selectedTime:selectedDate,events:events})}},ctrl._refreshView=function(){for(var startDate=ctrl.range.startTime,date=startDate.getDate(),month=(startDate.getMonth()+(1!==date?1:0))%12,year=startDate.getFullYear()+(1!==date&&0===month?1:0),days=getDates(startDate,42),i=0;i<42;i++)days[i]=angular.extend(createDateObject(days[i],ctrl.formatDay),{secondary:days[i].getMonth()!==month});scope.labels=new Array(7);for(var j=0;j<7;j++)scope.labels[j]=dateFilter(days[j].date,ctrl.formatDayHeader);var headerDate=new Date(year,month,1);if(scope.$parent.title=dateFilter(headerDate,ctrl.formatMonthTitle),scope.rows=ctrl.split(days,7),scope.showWeeks){scope.weekNumbers=[];for(var thursdayIndex=(11-ctrl.startingDay)%7,numWeeks=scope.rows.length,curWeek=0;curWeek<numWeeks;curWeek++)scope.weekNumbers.push(getISO8601WeekNumber(scope.rows[curWeek][thursdayIndex].date))}},ctrl._onDataLoaded=function(){var row,date,eventSource=ctrl.eventSource,len=eventSource?eventSource.length:0,startTime=ctrl.range.startTime,endTime=ctrl.range.endTime,utcStartTime=new Date(Date.UTC(startTime.getFullYear(),startTime.getMonth(),startTime.getDate())),utcEndTime=new Date(Date.UTC(endTime.getFullYear(),endTime.getMonth(),endTime.getDate())),rows=scope.rows,oneDay=864e5,eps=.001,hasEvent=!1;if(rows.hasEvent)for(row=0;row<6;row+=1)for(date=0;date<7;date+=1)rows[row][date].hasEvent&&(rows[row][date].events=null,rows[row][date].hasEvent=!1);for(var i=0;i<len;i+=1){var st,et,event=eventSource[i],eventStartTime=new Date(event.startTime),eventEndTime=new Date(event.endTime);if(event.allDay){if(eventEndTime<=utcStartTime||eventStartTime>=utcEndTime)continue;st=utcStartTime,et=utcEndTime}else{if(eventEndTime<=startTime||eventStartTime>=endTime)continue;st=startTime,et=endTime}var timeDiff,timeDifferenceStart;eventStartTime<=st?timeDifferenceStart=0:(timeDiff=eventStartTime-st,event.allDay||(timeDiff-=6e4*(eventStartTime.getTimezoneOffset()-st.getTimezoneOffset())),timeDifferenceStart=timeDiff/oneDay);var timeDifferenceEnd;eventEndTime>=et?(timeDiff=et-st,event.allDay||(timeDiff-=6e4*(et.getTimezoneOffset()-st.getTimezoneOffset())),timeDifferenceEnd=timeDiff/oneDay):(timeDiff=eventEndTime-st,event.allDay||(timeDiff-=6e4*(eventEndTime.getTimezoneOffset()-st.getTimezoneOffset())),timeDifferenceEnd=timeDiff/oneDay);for(var eventSet,index=Math.floor(timeDifferenceStart);index<timeDifferenceEnd-eps;){var rowIndex=Math.floor(index/7),dayIndex=Math.floor(index%7);rows[rowIndex][dayIndex].hasEvent=!0,eventSet=rows[rowIndex][dayIndex].events,eventSet?eventSet.push(event):(eventSet=[],eventSet.push(event),rows[rowIndex][dayIndex].events=eventSet),index+=1}}for(row=0;row<6;row+=1)for(date=0;date<7;date+=1)rows[row][date].hasEvent&&(hasEvent=!0,rows[row][date].events.sort(compareEvent));rows.hasEvent=hasEvent;var findSelected=!1;for(row=0;row<6;row+=1){for(date=0;date<7;date+=1)if(rows[row][date].selected){scope.selectedDate=rows[row][date],findSelected=!0;break}if(findSelected)break}},ctrl.compare=function(date1,date2){return new Date(date1.getFullYear(),date1.getMonth(),date1.getDate())-new Date(date2.getFullYear(),date2.getMonth(),date2.getDate())},ctrl._getRange=function(currentDate){var endDate,year=currentDate.getFullYear(),month=currentDate.getMonth(),firstDayOfMonth=new Date(year,month,1),difference=ctrl.startingDay-firstDayOfMonth.getDay(),numDisplayedFromPreviousMonth=difference>0?7-difference:-difference,startDate=new Date(firstDayOfMonth);return numDisplayedFromPreviousMonth>0&&startDate.setDate(1-numDisplayedFromPreviousMonth),endDate=new Date(startDate),endDate.setDate(endDate.getDate()+42),{startTime:startDate,endTime:endDate}},ctrl.refreshView()}}}]).directive("weekview",["dateFilter","$timeout",function(dateFilter,$timeout){"use strict";return{restrict:"EA",replace:!0,templateUrl:"template/rcalendar/week.html",require:"^calendar",link:function(scope,element,attrs,ctrl){function updateScrollGutter(){var children=element.children(),allDayEventBody=children[1].children[1],allDayEventGutterWidth=allDayEventBody.offsetWidth-allDayEventBody.clientWidth,normalEventBody=children[2],normalEventGutterWidth=normalEventBody.offsetWidth-normalEventBody.clientWidth,gutterWidth=allDayEventGutterWidth||normalEventGutterWidth||0;gutterWidth>0&&(scope.gutterWidth=gutterWidth,scope.allDayEventGutterWidth=allDayEventGutterWidth<=0?gutterWidth:0,scope.normalGutterWidth=normalEventGutterWidth<=0?gutterWidth:0)}function getDates(startTime,n){var dates=new Array(n),current=new Date(startTime),i=0;for(current.setHours(12);i<n;)dates[i++]={date:new Date(current)},current.setDate(current.getDate()+1);return dates}function createDateObjects(startTime){for(var row,time,times=[],currentHour=startTime.getHours(),currentDate=startTime.getDate(),hour=0;hour<24;hour+=1){row=[];for(var day=0;day<7;day+=1)time=new Date(startTime.getTime()),time.setHours(currentHour+hour),time.setDate(currentDate+day),row.push({time:time});times.push(row)}return times}function compareEventByStartOffset(eventA,eventB){return eventA.startOffset-eventB.startOffset}function getISO8601WeekNumber(date){var checkDate=new Date(date);checkDate.setDate(checkDate.getDate()+4-(checkDate.getDay()||7));var time=checkDate.getTime();return checkDate.setMonth(0),checkDate.setDate(1),Math.floor(Math.round((time-checkDate)/864e5)/7)+1}scope.formatWeekViewDayHeader=ctrl.formatWeekViewDayHeader,scope.formatHourColumn=ctrl.formatHourColumn,scope.allDayLabel=ctrl.allDayLabel,$timeout(function(){updateScrollGutter()}),ctrl.mode={step:{days:7}},scope.hourParts=ctrl.hourParts,scope.select=function(selectedTime,events){scope.timeSelected&&scope.timeSelected({selectedTime:selectedTime,events:events})},ctrl._onDataLoaded=function(){var eventSet,day,hour,eventSource=ctrl.eventSource,len=eventSource?eventSource.length:0,startTime=ctrl.range.startTime,endTime=ctrl.range.endTime,utcStartTime=new Date(Date.UTC(startTime.getFullYear(),startTime.getMonth(),startTime.getDate())),utcEndTime=new Date(Date.UTC(endTime.getFullYear(),endTime.getMonth(),endTime.getDate())),rows=scope.rows,dates=scope.dates,oneHour=36e5,oneDay=864e5,eps=.016,allDayEventInRange=!1,normalEventInRange=!1;if(rows.hasEvent){for(day=0;day<7;day+=1)for(hour=0;hour<24;hour+=1)rows[hour][day].events&&(rows[hour][day].events=null);rows.hasEvent=!1}if(dates.hasEvent){for(day=0;day<7;day+=1)dates[day].events&&(dates[day].events=null);dates.hasEvent=!1}for(var i=0;i<len;i+=1){var event=eventSource[i],eventStartTime=new Date(event.startTime),eventEndTime=new Date(event.endTime);if(event.allDay){if(eventEndTime<=utcStartTime||eventStartTime>=utcEndTime)continue;allDayEventInRange=!0;var allDayStartIndex;allDayStartIndex=eventStartTime<=utcStartTime?0:Math.floor((eventStartTime-utcStartTime)/oneDay);var allDayEndIndex;allDayEndIndex=eventEndTime>=utcEndTime?Math.ceil((utcEndTime-utcStartTime)/oneDay):Math.ceil((eventEndTime-utcStartTime)/oneDay);var displayAllDayEvent={event:event,startIndex:allDayStartIndex,endIndex:allDayEndIndex};eventSet=dates[allDayStartIndex].events,eventSet?eventSet.push(displayAllDayEvent):(eventSet=[],eventSet.push(displayAllDayEvent),dates[allDayStartIndex].events=eventSet)}else{if(eventEndTime<=startTime||eventStartTime>=endTime)continue;normalEventInRange=!0;var timeDiff,timeDifferenceStart;eventStartTime<=startTime?timeDifferenceStart=0:(timeDiff=eventStartTime-startTime-6e4*(eventStartTime.getTimezoneOffset()-startTime.getTimezoneOffset()),timeDifferenceStart=timeDiff/oneHour);var timeDifferenceEnd;eventEndTime>=endTime?(timeDiff=endTime-startTime-6e4*(endTime.getTimezoneOffset()-startTime.getTimezoneOffset()),timeDifferenceEnd=timeDiff/oneHour):(timeDiff=eventEndTime-startTime-6e4*(eventEndTime.getTimezoneOffset()-startTime.getTimezoneOffset()),timeDifferenceEnd=timeDiff/oneHour);var endRowIndex,startIndex=Math.floor(timeDifferenceStart),endIndex=Math.ceil(timeDifferenceEnd-eps),startRowIndex=startIndex%24,dayIndex=Math.floor(startIndex/24),endOfDay=24*dayIndex,startOffset=0,endOffset=0;1!==ctrl.hourParts&&(startOffset=Math.floor((timeDifferenceStart-startIndex)*ctrl.hourParts));do{endOfDay+=24,endOfDay<=endIndex?endRowIndex=24:(endRowIndex=endIndex%24,1!==ctrl.hourParts&&(endOffset=Math.floor((endIndex-timeDifferenceEnd)*ctrl.hourParts)));var displayEvent={event:event,startIndex:startRowIndex,endIndex:endRowIndex,startOffset:startOffset,endOffset:endOffset};eventSet=rows[startRowIndex][dayIndex].events,eventSet?eventSet.push(displayEvent):(eventSet=[],eventSet.push(displayEvent),rows[startRowIndex][dayIndex].events=eventSet),startRowIndex=0,startOffset=0,dayIndex+=1}while(endOfDay<endIndex)}}if(normalEventInRange)for(day=0;day<7;day+=1){var orderedEvents=[];for(hour=0;hour<24;hour+=1)rows[hour][day].events&&(rows[hour][day].events.sort(compareEventByStartOffset),orderedEvents=orderedEvents.concat(rows[hour][day].events));orderedEvents.length>0&&(rows.hasEvent=!0,ctrl.placeEvents(orderedEvents))}if(allDayEventInRange){var orderedAllDayEvents=[];for(day=0;day<7;day+=1)dates[day].events&&(orderedAllDayEvents=orderedAllDayEvents.concat(dates[day].events));orderedAllDayEvents.length>0&&(dates.hasEvent=!0,ctrl.placeAllDayEvents(orderedAllDayEvents))}$timeout(function(){updateScrollGutter()})},ctrl._refreshView=function(){var weekNumberIndex,title,firstDayOfWeek=ctrl.range.startTime,dates=getDates(firstDayOfWeek,7),weekFormatPattern="w";scope.rows=createDateObjects(firstDayOfWeek),scope.dates=dates,weekNumberIndex=ctrl.formatWeekTitle.indexOf(weekFormatPattern),title=dateFilter(firstDayOfWeek,ctrl.formatWeekTitle),-1!==weekNumberIndex&&(title=title.replace(weekFormatPattern,getISO8601WeekNumber(firstDayOfWeek))),scope.$parent.title=title},ctrl._getRange=function(currentDate){var year=currentDate.getFullYear(),month=currentDate.getMonth(),date=currentDate.getDate(),day=currentDate.getDay();return{startTime:new Date(year,month,date-day),endTime:new Date(year,month,date-day+7)}},ctrl.refreshView()}}}]).directive("dayview",["dateFilter","$timeout",function(dateFilter,$timeout){"use strict";return{restrict:"EA",replace:!0,templateUrl:"template/rcalendar/day.html",require:"^calendar",link:function(scope,element,attrs,ctrl){function updateScrollGutter(){var children=element.children(),allDayEventBody=children[0].children[1],allDayEventGutterWidth=allDayEventBody.offsetWidth-allDayEventBody.clientWidth,normalEventBody=children[1],normalEventGutterWidth=normalEventBody.offsetWidth-normalEventBody.clientWidth,gutterWidth=allDayEventGutterWidth||normalEventGutterWidth||0;gutterWidth>0&&(scope.allDayEventGutterWidth=allDayEventGutterWidth<=0?gutterWidth:0,scope.normalGutterWidth=normalEventGutterWidth<=0?gutterWidth:0)}function createDateObjects(startTime){for(var time,rows=[],currentHour=startTime.getHours(),currentDate=startTime.getDate(),hour=0;hour<24;hour+=1)time=new Date(startTime.getTime()),time.setHours(currentHour+hour),time.setDate(currentDate),rows.push({time:time});return rows}function compareEventByStartOffset(eventA,eventB){return eventA.startOffset-eventB.startOffset}scope.formatHourColumn=ctrl.formatHourColumn,scope.allDayLabel=ctrl.allDayLabel,$timeout(function(){updateScrollGutter()}),ctrl.mode={step:{days:1}},scope.hourParts=ctrl.hourParts,scope.select=function(selectedTime,events){scope.timeSelected&&scope.timeSelected({selectedTime:selectedTime,events:events})},ctrl._onDataLoaded=function(){var eventSet,hour,eventSource=ctrl.eventSource,len=eventSource?eventSource.length:0,startTime=ctrl.range.startTime,endTime=ctrl.range.endTime,utcStartTime=new Date(Date.UTC(startTime.getFullYear(),startTime.getMonth(),startTime.getDate())),utcEndTime=new Date(Date.UTC(endTime.getFullYear(),endTime.getMonth(),endTime.getDate())),rows=scope.rows,allDayEvents=[],oneHour=36e5,eps=.016,normalEventInRange=!1;if(rows.hasEvent){for(hour=0;hour<24;hour+=1)rows[hour].events&&(rows[hour].events=null);rows.hasEvent=!1}for(var i=0;i<len;i+=1){var event=eventSource[i],eventStartTime=new Date(event.startTime),eventEndTime=new Date(event.endTime);if(event.allDay){if(eventEndTime<=utcStartTime||eventStartTime>=utcEndTime)continue;allDayEvents.push({event:event})}else{if(eventEndTime<=startTime||eventStartTime>=endTime)continue;normalEventInRange=!0;var timeDiff,timeDifferenceStart;eventStartTime<=startTime?timeDifferenceStart=0:(timeDiff=eventStartTime-startTime-6e4*(eventStartTime.getTimezoneOffset()-startTime.getTimezoneOffset()),timeDifferenceStart=timeDiff/oneHour);var timeDifferenceEnd;eventEndTime>=endTime?(timeDiff=endTime-startTime-6e4*(endTime.getTimezoneOffset()-startTime.getTimezoneOffset()),timeDifferenceEnd=timeDiff/oneHour):(timeDiff=eventEndTime-startTime-6e4*(eventEndTime.getTimezoneOffset()-startTime.getTimezoneOffset()),timeDifferenceEnd=timeDiff/oneHour);var startIndex=Math.floor(timeDifferenceStart),endIndex=Math.ceil(timeDifferenceEnd-eps),startOffset=0,endOffset=0;1!==ctrl.hourParts&&(startOffset=Math.floor((timeDifferenceStart-startIndex)*ctrl.hourParts),endOffset=Math.floor((endIndex-timeDifferenceEnd)*ctrl.hourParts));var displayEvent={event:event,startIndex:startIndex,endIndex:endIndex,startOffset:startOffset,endOffset:endOffset};eventSet=rows[startIndex].events,eventSet?eventSet.push(displayEvent):(eventSet=[],eventSet.push(displayEvent),rows[startIndex].events=eventSet)}}if(normalEventInRange){var orderedEvents=[];for(hour=0;hour<24;hour+=1)rows[hour].events&&(rows[hour].events.sort(compareEventByStartOffset),orderedEvents=orderedEvents.concat(rows[hour].events));orderedEvents.length>0&&(rows.hasEvent=!0,ctrl.placeEvents(orderedEvents))}scope.allDayEvents=allDayEvents,$timeout(function(){updateScrollGutter()})},ctrl._refreshView=function(){var startingDate=ctrl.range.startTime;scope.rows=createDateObjects(startingDate),scope.allDayEvents=[],scope.dates=[startingDate],scope.$parent.title=dateFilter(startingDate,ctrl.formatDayTitle)},ctrl._getRange=function(currentDate){var year=currentDate.getFullYear(),month=currentDate.getMonth(),date=currentDate.getDate();return{startTime:new Date(year,month,date),endTime:new Date(year,month,date+1)}},ctrl.refreshView()}}}]),angular.module("template/rcalendar/calendar.html",[]).run(["$templateCache",function($templateCache){$templateCache.put("template/rcalendar/calendar.html",'<div ng-switch="calendarMode">\n    <div class="row calendar-navbar">\n        <div class="nav-left col-xs-2">\n            <button type="button" class="btn btn-default btn-sm" ng-click="move(-1)"><i\n                    class="glyphicon glyphicon-chevron-left"></i></button>\n        </div>\n        <div class="calendar-header col-xs-8">{{title}}</div>\n        <div class="nav-right col-xs-2">\n            <button type="button" class="btn btn-default btn-sm" ng-click="move(1)"><i\n                    class="glyphicon glyphicon-chevron-right"></i></button>\n        </div>\n    </div>\n    <dayview ng-switch-when="day"></dayview>\n    <monthview ng-switch-when="month"></monthview>\n    <weekview ng-switch-when="week"></weekview>\n</div>\n')}]),angular.module("template/rcalendar/day.html",[]).run(["$templateCache",function($templateCache){$templateCache.put("template/rcalendar/day.html",'<div>\n    <div class="dayview-allday-table">\n        <div class="dayview-allday-label">\n            {{allDayLabel}}\n        </div>\n        <div class="dayview-allday-content-wrapper">\n            <table class="table table-bordered dayview-allday-content-table">\n                <tbody>\n                <tr>\n                    <td class="calendar-cell" ng-class="{\'calendar-event-wrap\':allDayEvents}"\n                        ng-style="{height: 25*allDayEvents.length+\'px\'}">\n                        <div ng-repeat="displayEvent in allDayEvents" class="calendar-event"\n                             ng-click="eventSelected({event:displayEvent.event})"\n                             ng-style="{top: 25*$index+\'px\',width: \'100%\',height:\'25px\'}">\n                            <div class="calendar-event-inner">{{displayEvent.event.title}}</div>\n                        </div>\n                    </td>\n                    <td ng-if="allDayEventGutterWidth>0" class="gutter-column"\n                        ng-style="{width:allDayEventGutterWidth+\'px\'}"></td>\n                </tr>\n                </tbody>\n            </table>\n        </div>\n    </div>\n    <div class="scrollable" style="height: 400px">\n        <table class="table table-bordered table-fixed">\n            <tbody>\n            <tr ng-repeat="tm in rows track by $index">\n                <td class="calendar-hour-column text-center">\n                    {{tm.time | date: formatHourColumn}}\n                </td>\n                <td class="calendar-cell" ng-click="select(tm.time, tm.events)">\n                    <div ng-class="{\'calendar-event-wrap\': tm.events}" ng-if="tm.events">\n                        <div ng-repeat="displayEvent in tm.events" class="calendar-event"\n                             ng-click="eventSelected({event:displayEvent.event})"\n'+"                             ng-style=\"{top: (37*displayEvent.startOffset/hourParts)+'px', left: 100/displayEvent.overlapNumber*displayEvent.position+'%', width: 100/displayEvent.overlapNumber+'%', height: 37*(displayEvent.endIndex -displayEvent.startIndex - (displayEvent.endOffset + displayEvent.startOffset)/hourParts)+'px'}\">                            <div class=\"calendar-event-inner\">{{displayEvent.event.title}}</div>\n                        </div>\n                    </div>\n                </td>\n            </tr>\n            </tbody>\n        </table>\n    </div>\n</div>")}]),angular.module("template/rcalendar/month.html",[]).run(["$templateCache",function($templateCache){$templateCache.put("template/rcalendar/month.html",'<div>\n    <table class="table table-bordered table-fixed monthview-datetable monthview-datetable">\n        <thead>\n        <tr>\n            <th ng-show="showWeeks" class="calendar-week-column text-center">#</th>\n            <th ng-repeat="label in labels track by $index" class="text-center">\n                <small>{{label}}</small>\n            </th>\n        </tr>\n        </thead>\n        <tbody>\n        <tr ng-repeat="row in rows track by $index">\n            <td ng-show="showWeeks" class="calendar-week-column text-center">\n                <small><em>{{ weekNumbers[$index] }}</em></small>\n            </td>\n            <td ng-repeat="dt in row track by dt.date" class="monthview-dateCell" ng-click="select(dt)"\n                ng-class="{\'text-center\':true, \'monthview-current\': dt.current&&!dt.selected&&!dt.hasEvent,\'monthview-secondary-with-event\': dt.secondary&&dt.hasEvent, \'monthview-primary-with-event\':!dt.secondary&&dt.hasEvent&&!dt.selected, \'monthview-selected\': dt.selected}">\n                <div ng-class="{\'text-muted\':dt.secondary}">\n                    {{dt.label}}\n                </div>\n            </td>\n        </tr>\n        </tbody>\n    </table>\n    <div ng-if="showEventDetail" class="event-detail-container">\n        <div class="scrollable" style="height: 200px">\n            <table class="table table-bordered table-striped table-fixed">\n                <tr ng-repeat="event in selectedDate.events" ng-if="selectedDate.events">\n                    <td ng-if="!event.allDay" class="monthview-eventdetail-timecolumn">{{event.startTime|date: \'HH:mm\'}}\n                        -\n                        {{event.endTime|date: \'HH:mm\'}}\n                    </td>\n                    <td ng-if="event.allDay" class="monthview-eventdetail-timecolumn">{{allDayLabel}}</td>\n                    <td class="event-detail" ng-click="eventSelected({event:event})">{{event.title}}</td>\n                </tr>\n                <tr ng-if="!selectedDate.events"><td class="no-event-label">{{noEventsLabel}}</td></tr>\n            </table>\n        </div>\n    </div>\n</div>')}]),angular.module("template/rcalendar/week.html",[]).run(["$templateCache",function($templateCache){$templateCache.put("template/rcalendar/week.html",'<div>\n    <table class="table table-bordered table-fixed weekview-header">\n        <thead>\n        <tr>\n            <th class="calendar-hour-column"></th>\n            <th ng-repeat="dt in dates" class="text-center weekview-header-label">{{dt.date| date:\n                formatWeekViewDayHeader}}\n            </th>\n            <th ng-if="gutterWidth>0" class="gutter-column" ng-style="{width: gutterWidth+\'px\'}"></th>\n        </tr>\n        </thead>\n    </table>\n    <div class="weekview-allday-table">\n        <div class="weekview-allday-label">\n            {{allDayLabel}}\n        </div>\n        <div class="weekview-allday-content-wrapper">\n            <table class="table table-bordered table-fixed weekview-allday-content-table">\n                <tbody>\n                <tr>\n                    <td ng-repeat="day in dates track by day.date" class="calendar-cell">\n                        <div ng-class="{\'calendar-event-wrap\': day.events}" ng-if="day.events"\n                             ng-style="{height: 25*day.events.length+\'px\'}">\n                            <div ng-repeat="displayEvent in day.events" class="calendar-event"\n                                 ng-click="eventSelected({event:displayEvent.event})"\n                                 ng-style="{top: 25*displayEvent.position+\'px\', width: 100*(displayEvent.endIndex-displayEvent.startIndex)+\'%\', height: \'25px\'}">\n                                <div class="calendar-event-inner">{{displayEvent.event.title}}</div>\n                            </div>\n                        </div>\n                    </td>\n                    <td ng-if="allDayEventGutterWidth>0" class="gutter-column"\n                        ng-style="{width: allDayEventGutterWidth+\'px\'}"></td>\n                </tr>\n                </tbody>\n            </table>\n        </div>\n    </div>\n    <div class="scrollable" style="height: 400px">\n        <table class="table table-bordered table-fixed">\n            <tbody>\n            <tr ng-repeat="row in rows track by $index">\n                <td class="calendar-hour-column text-center">\n                    {{row[0].time | date: formatHourColumn}}\n                </td>\n                <td ng-repeat="tm in row track by tm.time" class="calendar-cell" ng-click="select(tm.time, tm.events)">\n                    <div ng-class="{\'calendar-event-wrap\': tm.events}" ng-if="tm.events">\n                        <div ng-repeat="displayEvent in tm.events" class="calendar-event"\n                             ng-click="eventSelected({event:displayEvent.event})"\n                             ng-style="{top: (37*displayEvent.startOffset/hourParts)+\'px\',left: 100/displayEvent.overlapNumber*displayEvent.position+\'%\', width: 100/displayEvent.overlapNumber+\'%\', height: 37*(displayEvent.endIndex -displayEvent.startIndex - (displayEvent.endOffset + displayEvent.startOffset)/hourParts)+\'px\'}">                            <div class="calendar-event-inner">{{displayEvent.event.title}}</div>\n                        </div>\n                    </div>\n                </td>\n                <td ng-if="normalGutterWidth>0" class="gutter-column" ng-style="{width: normalGutterWidth+\'px\'}"></td>\n            </tr>\n            </tbody>\n        </table>\n    </div>\n</div>')}]);